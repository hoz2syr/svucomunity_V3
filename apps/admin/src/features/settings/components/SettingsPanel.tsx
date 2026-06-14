import { useState, useEffect, useCallback } from 'react';
import {
  Settings as SettingsIcon,
  Save,
  RotateCcw,
  Globe,
  Shield,
  Wrench,
  Sparkles,
} from 'lucide-react';
import type {
  AppSettings,
  SettingsUpdatePayload,
  ConnectionTestResult,
} from '@/services/api';
import {
  fetchSettings,
  updateSettings,
  testSupabaseConnection,
  DEFAULT_SETTINGS,
} from '@/services/api';

export function SettingsPanel() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastTest, setLastTest] = useState<ConnectionTestResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchSettings()
      .then((s) => {
        if (!cancelled) {
          setSettings(s);
          setDirty(false);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'فشل تحميل الإعدادات');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = useCallback(
    <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
      setDirty(true);
      setError(null);
    },
    [],
  );

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      const updated = await updateSettings(settings);
      setSettings(updated);
      setDirty(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'فشل حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  }, [settings]);

  const handleReset = useCallback(async () => {
    if (!window.confirm('هل تريد إعادة تعيين جميع الإعدادات للقيم الافتراضية؟')) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const reset = await updateSettings(DEFAULT_SETTINGS);
      setSettings(reset);
      setDirty(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'فشل إعادة تعيين الإعدادات');
    } finally {
      setSaving(false);
    }
  }, []);

  const handleTestConnection = useCallback(async () => {
    setTesting(true);
    setError(null);
    try {
      const result = await testSupabaseConnection();
      setLastTest(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'فشل اختبار الاتصال');
    } finally {
      setTesting(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <p className="text-sm text-slate-400">جاري تحميل الإعدادات…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-panel mx-auto max-w-3xl" dir="rtl">
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-xl bg-indigo-600/10 p-2.5">
          <SettingsIcon className="h-6 w-6 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">الإعدادات</h1>
          <p className="text-sm text-slate-400">
            إدارة إعدادات وتفضيلات التطبيق
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <div className="mb-4 flex items-center gap-3">
            <Globe className="h-5 w-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-white">
              معلومات التطبيق
            </h2>
          </div>
          <div className="space-y-4">
            <Field label="عنوان الموقع" required>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => handleChange('siteName', e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
                placeholder="أدخل عنوان الموقع"
              />
            </Field>
            <Field label="الوصف">
              <textarea
                value={settings.siteDescription}
                onChange={(e) => handleChange('siteDescription', e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
                placeholder="صف تطبيقك"
              />
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <div className="mb-4 flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-white">المظهر</h2>
          </div>
          <Field label="المظهر الافتراضي">
            <div className="flex gap-3">
              {(['light', 'dark', 'system'] as const).map((theme) => (
                <button
                  key={theme}
                  type="button"
                  onClick={() => handleChange('defaultTheme', theme)}
                  className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all ${
                    settings.defaultTheme === theme
                      ? 'border-indigo-500 bg-indigo-600/20 text-indigo-200'
                      : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {theme === 'light' ? 'فاتح' : theme === 'dark' ? 'داكن' : 'تلقائي'}
                </button>
              ))}
            </div>
          </Field>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <div className="mb-4 flex items-center gap-3">
            <Shield className="h-5 w-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-white">التسجيل</h2>
          </div>
          <ToggleField
            label="السماح بتسجيلات جديدة"
            description="يمكن للمستخدمين إنشاء حسابات جديدة عند التفعيل"
            checked={settings.allowNewRegistrations}
            onChange={(checked) => handleChange('allowNewRegistrations', checked)}
          />
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <div className="mb-4 flex items-center gap-3">
            <Wrench className="h-5 w-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-white">الصيانة</h2>
          </div>
          <ToggleField
            label="وضع الصيانة"
            description="سيظهر للزوار صفحة صيانة عند التفعيل"
            checked={settings.maintenanceMode}
            warning
            onChange={(checked) => handleChange('maintenanceMode', checked)}
          />
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <div className="mb-4 flex items-center gap-3">
            <SettingsIcon className="h-5 w-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-white">
              اتصال Supabase
            </h2>
          </div>
          <p className="mb-4 text-sm text-slate-400">
            تأكد من أن التطبيق يمكنه الاتصال بقاعدة بيانات Supabase.
          </p>
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testing}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {testing ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                جاري الاختبار…
              </>
            ) : (
              <>
                <Wrench className="h-4 w-4" />
                اختبار الاتصال
              </>
            )}
          </button>
          {lastTest && (
            <ConnectionResult result={lastTest} />
          )}
        </section>
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
        <button
          type="button"
          onClick={handleReset}
          disabled={saving || !dirty}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:text-white disabled:opacity-50"
        >
          <RotateCcw className="h-4 w-4" />
          إعادة تعيين
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !dirty}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {saving ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              جاري الحفظ…
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              حفظ التعديلات
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-300">
        {label}
        {required && <span className="mr-1 text-indigo-400">*</span>}
      </label>
      {children}
    </div>
  );
}

function ToggleField({
  label,
  description,
  checked,
  onChange,
  warning,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  warning?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p
          className={`text-sm font-medium ${
            warning && checked ? 'text-amber-300' : 'text-white'
          }`}
        >
          {label}
        </p>
        {description && (
          <p className="mt-0.5 text-sm text-slate-400">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-8 min-w-[3rem] shrink-0 items-center rounded-full px-0.5 transition-colors ${
          checked ? 'bg-indigo-600' : 'bg-white/10'
        }`}
      >
        <span
          className={`inline-block h-6 w-6 rounded-full bg-white shadow-md transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

function ConnectionResult({ result }: { result: ConnectionTestResult }) {
  return (
    <div
      className={`mt-4 flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${
        result.success
          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
          : 'border-red-500/30 bg-red-500/10 text-red-300'
      }`}
    >
      <span>
        {result.success ? 'الاتصال ناجح' : 'فشل الاتصال'}
      </span>
      <span className="text-slate-400">
        {result.latency}ms · {new Date(result.timestamp).toLocaleTimeString('ar-SA')}
      </span>
    </div>
  );
}
