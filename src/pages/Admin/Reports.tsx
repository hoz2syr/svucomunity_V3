'use client';

import { useMemo, useState } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { Button } from '@/src/components/ui/Button';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { Icon } from '@/src/components/ui/Icon';
import { usePlatformStats, useRefreshAdminData } from '../../features/admin/hooks/useAdminExtractions';
import {
  Users,
  FileText,
  BookOpen,
  User,
  BarChart3,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  BookOpenCheck,
  UsersRound,
  Shield,
} from 'lucide-react';
import { AdminStatCard } from '@/src/components/admin/AdminStatCard';

export function Reports() {
  const { profile, loading: authLoading } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const refresh = useRefreshAdminData();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: stats, isLoading: statsLoading, error: statsError, refetch } = usePlatformStats();

  const coursesVerificationRate = useMemo(() => {
    if (!stats) return 0;
    const total = stats.verified_courses + stats.unverified_courses;
    return total > 0 ? (stats.verified_courses / total) * 100 : 0;
  }, [stats]);

  const instructorsVerificationRate = useMemo(() => {
    if (!stats) return 0;
    const total = stats.verified_instructors + stats.unverified_instructors;
    return total > 0 ? (stats.verified_instructors / total) * 100 : 0;
  }, [stats]);

  const avgCoursesPerExtraction = useMemo(() => {
    if (!stats || stats.total_extractions === 0) return '0';
    return (stats.total_courses / stats.total_extractions).toFixed(1);
  }, [stats]);

  const avgExtractionsPerUser = useMemo(() => {
    if (!stats || stats.total_users === 0) return '0';
    return (stats.total_extractions / stats.total_users).toFixed(1);
  }, [stats]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-cyan-400 text-lg">جاري التحميل...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <GlassCard className="p-8 text-center max-w-md">
          <Icon icon={Shield} size="xl" className="text-rose-400 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">غير مصرح</h2>
          <p className="text-slate-400 text-sm">ليس لديك صلاحية الوصول لهذه الصفحة</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pt-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white tracking-tight">التقارير</h1>
          <p className="text-slate-400 text-sm max-w-xl">
            نظرة عامة على أداء المنصة والنشاط
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={async () => {
            setIsRefreshing(true);
            try {
              await Promise.all([refetch(), refresh()]);
            } finally {
              setIsRefreshing(false);
            }
          }}
          icon={<Icon icon={RefreshCw} size="xs" />}
          disabled={isRefreshing}
        >
          {isRefreshing ? 'جاري التحديث...' : 'تحديث'}
        </Button>
      </div>

      {statsError && (
        <GlassCard className="p-4 border-rose-500/30">
          <div className="flex items-center gap-2 text-rose-400">
            <Icon icon={AlertTriangle} size="sm" />
            <span className="text-sm">{statsError instanceof Error ? statsError.message : 'حدث خطأ'}</span>
          </div>
        </GlassCard>
      )}

      {statsLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <GlassCard key={i} className="p-5">
              <Skeleton className="w-full h-20" />
            </GlassCard>
          ))}
        </div>
      ) : stats ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <AdminStatCard label="إجمالي المستخدمين" value={stats.total_users} icon={<Users size={24} />} color="cyan" />
            <AdminStatCard label="إجمالي الاستخراجات" value={stats.total_extractions} icon={<FileText size={24} />} color="blue" />
            <AdminStatCard label="إجمالي المواد" value={stats.total_courses} icon={<BookOpen size={24} />} color="emerald" />
            <AdminStatCard label="إجمالي المحاضرين" value={stats.total_instructors} icon={<User size={24} />} color="amber" />
            <AdminStatCard label="إجمالي التخصصات" value={stats.total_majors} icon={<BarChart3 size={24} />} color="rose" />
            <AdminStatCard label="إجمالي الاختبارات" value={stats.total_tests} icon={<BookOpenCheck size={24} />} color="cyan" />
            <AdminStatCard label="إجمالي المجموعات" value={stats.total_groups} icon={<UsersRound size={24} />} color="blue" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <GlassCard className="p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Icon icon={ShieldCheck} size="sm" className="text-cyan-400" />
                حالة التحقق
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">المواد المحققة</span>
                    <span className="text-sm text-white font-medium">
                      {stats.verified_courses} / {stats.verified_courses + stats.unverified_courses}
                    </span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all"
                      style={{ width: `${coursesVerificationRate}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">المحاضرين المحققين</span>
                    <span className="text-sm text-white font-medium">
                      {stats.verified_instructors} / {stats.verified_instructors + stats.unverified_instructors}
                    </span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2">
                    <div
                      className="bg-cyan-500 h-2 rounded-full transition-all"
                      style={{ width: `${instructorsVerificationRate}%` }}
                    />
                  </div>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Icon icon={BarChart3} size="sm" className="text-cyan-400" />
                ملخص النشاط
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <span className="text-sm text-slate-400">متوسط المواد لكل استخراج</span>
                  <span className="text-sm text-white font-medium">{avgCoursesPerExtraction}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <span className="text-sm text-slate-400">متوسط الاستخراجات لكل مستخدم</span>
                  <span className="text-sm text-white font-medium">{avgExtractionsPerUser}</span>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      ) : (
        <GlassCard className="p-8 text-center">
          <Icon icon={CheckCircle2} size="xl" className="text-emerald-400 mb-3" />
          <p className="text-slate-400 text-sm">لا توجد بيانات متاحة</p>
        </GlassCard>
      )}
    </div>
  );
}
