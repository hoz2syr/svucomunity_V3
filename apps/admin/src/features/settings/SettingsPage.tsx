import { SettingsPanel } from './components/SettingsPanel';

function SettingsPage() {
  return (
    <div className="p-8 space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">الإعدادات</h1>
        <p className="text-slate-400">إعدادات التطبيق والنظام</p>
      </div>
      <SettingsPanel />
    </div>
  );
}

export default SettingsPage;
