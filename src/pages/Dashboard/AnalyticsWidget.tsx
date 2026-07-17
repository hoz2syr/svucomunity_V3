'use client';

import { Link } from 'react-router-dom';
import { TrendingUp, ArrowLeft } from 'lucide-react';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { Button } from '@/src/components/ui/Button';
import { Icon } from '@/src/components/ui/Icon';
import { usePopularCourses, usePopularInstructors, useMajorDistribution } from '@/src/features/schedule-extraction/hooks/useAnalytics';

export function AnalyticsWidget() {
  const { data: courses, isLoading: coursesLoading } = usePopularCourses(5);
  const { data: instructors } = usePopularInstructors(5);
  const { data: majors } = useMajorDistribution();

  const topCourses = courses?.slice(0, 5) || [];

  return (
    <GlassCard className="p-6 h-full">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-extrabold text-white flex items-center gap-2">
          <Icon icon={TrendingUp} size="md" />
          إحصائيات الاستخراج
        </h3>
        <Link to="/admin/analytics">
          <Button variant="ghost" icon={<ArrowLeft size={14} />} className="text-xs py-1.5 px-3">
            عرض الكل
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5">
          <span className="text-lg font-black text-cyan-400">{coursesLoading ? '--' : (courses?.length || 0)}</span>
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mt-1">المواد</span>
        </div>
        <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5">
          <span className="text-lg font-black text-indigo-400">{instructors?.length || 0}</span>
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mt-1">الأساتذة</span>
        </div>
        <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5">
          <span className="text-lg font-black text-emerald-400">{majors?.length || 0}</span>
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mt-1">التخصصات</span>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">أعلى المواد ظهوراً</h4>
        {coursesLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
              <div className="flex items-center gap-2 flex-1">
                <Skeleton className="w-5 h-5 rounded shrink-0" />
                <Skeleton className="w-24 h-3" />
              </div>
              <Skeleton className="w-8 h-3" />
            </div>
          ))
        ) : topCourses.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-3">لا توجد بيانات متاحة</p>
        ) : (
          topCourses.map((course, index) => (
            <div
              key={course.course_code + course.section}
              className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/8 transition-colors"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-cyan-500/10 text-cyan-400 text-[10px] font-black">
                  {index + 1}
                </span>
                <span className="text-xs font-bold text-white truncate">{course.course_name}</span>
              </div>
              <span className="text-[10px] font-bold text-cyan-400 shrink-0 mr-1">{course.seen_count}</span>
            </div>
          ))
        )}
      </div>

      <div className="mt-5 pt-4 border-t border-white/8">
        <Link to="/admin/analytics" className="block">
          <Button variant="secondary" className="w-full justify-center text-xs">
            التحليلات الكاملة
          </Button>
        </Link>
      </div>
    </GlassCard>
  );
}
