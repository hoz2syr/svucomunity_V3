'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { loadCurrentSemesterCourses } from '../../features/schedule-extraction/services';
import { getCurrentSemesterCode, convertSemesterCodeToLabel } from '../../features/schedule-extraction/utils/semesterUtils';
import { GlassCard } from '../../components/ui/GlassCard';
import { Skeleton } from '../../components/ui/Skeleton';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { GraduationCap, BookOpen, RefreshCw, AlertCircle, CalendarDays } from 'lucide-react';
import { CourseSuggestionCard } from '../../features/schedule-extraction/components/CourseSuggestionCard';
import { useUserCourseProgress } from '../../features/schedule-extraction/hooks/useUserCourseProgress';

const COURSE_SKELETON_COUNT = 3;

export const CurrentSemesterCard = () => {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const semesterCode = getCurrentSemesterCode();
  const semesterLabel = convertSemesterCodeToLabel(semesterCode);

  const { data: courses = [], isLoading, error, refetch } = useQuery({
    queryKey: ['current-semester-courses', userId, semesterCode],
    queryFn: async () => {
      if (!userId) return [];
      const result = await loadCurrentSemesterCourses(userId, semesterCode);
      if (result.error) throw result.error;
      return result.data ?? [];
    },
    enabled: Boolean(userId),
  });

  const { data: progress = [] } = useUserCourseProgress();

  const handleRetry = () => {
    refetch();
  };

  return (
    <div className="w-full space-y-4">
      <GlassCard className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <Icon icon={GraduationCap} size="lg" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">الفصل الحالي</h2>
              <p className="text-sm text-[var(--color-text-secondary)]">{semesterLabel}</p>
            </div>
          </div>
          {courses.length > 0 && (
            <span className="text-xs font-bold text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
              {courses.length} مقرر
            </span>
          )}
        </div>
      </GlassCard>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: COURSE_SKELETON_COUNT }).map((_, i) => (
            <GlassCard key={i} className="p-5">
              <Skeleton className="w-3/4 h-5 mb-3" />
              <Skeleton className="w-1/2 h-4 mb-4" />
              <Skeleton className="w-full h-10" />
            </GlassCard>
          ))}
        </div>
      )}

      {error && !isLoading && (
        <GlassCard className="p-6 flex flex-col items-center text-center">
          <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
            <Icon icon={AlertCircle} size="lg" className="text-red-400" />
          </div>
          <p className="text-red-400 text-sm mb-4">فشل تحميل المقررات</p>
          <Button variant="secondary" onClick={handleRetry} icon={<RefreshCw size={16} />}>
            إعادة المحاولة
          </Button>
        </GlassCard>
      )}

      {!isLoading && !error && courses.length === 0 && (
        <GlassCard className="p-8 flex flex-col items-center text-center">
          <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <Icon icon={BookOpen} size="xl" className="text-[var(--color-text-secondary)]" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">لا توجد مقررات</h3>
          <p className="text-sm text-[var(--color-text-secondary)] max-w-sm mb-6">
            لم يتم العثور على مقررات للفصل الحالي. قم باستخراج جدولك الدراسي لعرض مقرراتك هنا.
          </p>
          <Button variant="primary" to="/dashboard/schedule" icon={<CalendarDays size={16} />}>
            استخراج الجدول
          </Button>
        </GlassCard>
      )}

      {!isLoading && !error && courses.length > 0 && (
        <div className="space-y-4">
          {courses.map((course) => {
            const courseProgress = progress.find(p => p.course_code === course.full_code);
            return (
              <CourseSuggestionCard
                key={course.id}
                course={course}
                userProgress={courseProgress}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
