'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { Button } from '@/src/components/ui/Button';
import { Icon } from '@/src/components/ui/Icon';
import {
  CalendarDays,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { confirmSemesterTransition, getCurrentSystemSemester } from '../../features/admin/services/adminSemesterTransition.supabase';
import { convertSemesterCodeToLabel } from '../../features/schedule-extraction/utils/semesterUtils';
import { cn } from '@/src/lib/utils';

const VALID_SEMESTERS = ['S25', 'F25', 'S26', 'F26'];

export function SemesterTransitionPage() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';

  const [currentSemester, setCurrentSemester] = useState<string | null>(null);
  const [nextSemester, setNextSemester] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useState(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getCurrentSystemSemester();
        if (!cancelled) {
          if (result.error) {
            setError(result.error.message);
          } else {
            setCurrentSemester(result.data ?? 'S25');
          }
        }
      } catch {
        if (!cancelled) {
          setError('فشل تحميل الفصل الحالي');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  });

  const handleTransition = async () => {
    if (!nextSemester || !profile?.id) return;
    setTransitioning(true);
    setError(null);
    setSuccess(null);

    const result = await confirmSemesterTransition(profile?.role || '', profile.id, nextSemester);

    if (result.error) {
      setError(result.error.message);
    } else {
      setSuccess(`تم الانتقال إلى ${convertSemesterCodeToLabel(nextSemester)} بنجاح`);
      setCurrentSemester(nextSemester);
      setNextSemester('');
    }
    setTransitioning(false);
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <GlassCard className="p-8 text-center max-w-md">
          <Icon icon={AlertTriangle} size="xl" className="text-rose-400 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">غير مصرح</h2>
          <p className="text-slate-400 text-sm">ليس لديك صلاحية الوصول لهذه الصفحة</p>
        </GlassCard>
      </div>
    );
  }

  const availableSemesters = VALID_SEMESTERS.filter(s => s !== currentSemester);

  return (
    <div className="space-y-6">
      <div className="pt-4">
        <h1 className="text-3xl font-bold text-white tracking-tight">الانتقال بين الفصول</h1>
        <p className="text-slate-400 text-sm mt-1">
          تأكيد الانتقال إلى الفصل الدراسي التالي وأرشفة المجموعات القديمة
        </p>
      </div>

      {error && (
        <GlassCard className="p-4 border-rose-500/30">
          <div className="flex items-center gap-2 text-rose-400">
            <Icon icon={AlertTriangle} size="sm" />
            <span className="text-sm">{error}</span>
          </div>
        </GlassCard>
      )}

      {success && (
        <GlassCard className="p-4 border-emerald-500/30">
          <div className="flex items-center gap-2 text-emerald-400">
            <Icon icon={CheckCircle2} size="sm" />
            <span className="text-sm">{success}</span>
          </div>
        </GlassCard>
      )}

      {loading ? (
        <GlassCard className="p-6">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
            <span className="text-slate-400">جاري تحميل الفصل الحالي...</span>
          </div>
        </GlassCard>
      ) : (
        <GlassCard className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
              <Icon icon={CalendarDays} size="lg" className="text-cyan-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">الفصل الحالي</p>
              <p className="text-xl font-bold text-white">
                {currentSemester ? convertSemesterCodeToLabel(currentSemester) : 'غير محدد'}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm text-slate-400">اختر الفصل التالي</label>
            <select
              value={nextSemester}
              onChange={(e) => setNextSemester(e.target.value)}
              className={cn(
                'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white',
                'focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
              disabled={transitioning || availableSemesters.length === 0}
            >
              <option value="">-- اختر الفصل --</option>
              {availableSemesters.map((sem) => (
                <option key={sem} value={sem}>
                  {convertSemesterCodeToLabel(sem)}
                </option>
              ))}
            </select>
          </div>

          <Button
            onClick={handleTransition}
            disabled={!nextSemester || transitioning}
            className="w-full"
          >
            {transitioning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                جاري التنفيذ...
              </>
            ) : (
              'تأكيد الانتقال للفصل التالي'
            )}
          </Button>
        </GlassCard>
      )}
    </div>
  );
}
