'use client';

import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { loadCurrentSemesterCourses } from '../../features/schedule-extraction/services';
import { getActiveSemesterCode } from '../../features/schedule-extraction/utils/semesterUtils';
import { GlassCard } from '../../components/ui/GlassCard';
import { Skeleton } from '../../components/ui/Skeleton';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { GraduationCap, BookOpen, RefreshCw, AlertCircle, CalendarDays } from 'lucide-react';
import { CourseSuggestionCard } from '../../features/schedule-extraction/components/CourseSuggestionCard';
import { useUserCourseProgress } from '../../features/schedule-extraction/hooks/useUserCourseProgress';

const COURSE_SKELETON_COUNT = 3;

export const CurrentSemesterCard = React.memo(function CurrentSemesterCard() {
  const { session, profile } = useAuth();
  const userId = session?.user?.id;
  const semesterCode = profile?.current_semester || getActiveSemesterCode();
  const studentMajor = profile?.major || '';

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

  const mainCourses = studentMajor ? courses.filter(c => c.major === studentMajor) : courses;
  const englishCourses = courses.filter(c => c.major === 'ENG (English Language)');
  const additionalCourses = studentMajor
    ? courses.filter(c => c.major !== studentMajor && c.major !== 'ENG (English Language)' && c.major)
    : courses.filter(c => c.major !== 'ENG (English Language)' && c.major);

  const handleRetry = () => {
    refetch();
  };

  return (
     <div className="w-full space-y-4">
       <GlassCard className="p-4 border-amber-700/30 shadow-[4px_4px_0px_0px_rgba(180,130,50,0.25)]">
         <div className="flex items-center justify-between">
           <div className="flex items-center gap-2.5">
             <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
               <Icon icon={GraduationCap} size="lg" />
             </div>
             <div>
               <h2 className="text-lg font-bold text-stone-100">الفصل الحالي</h2>
                <p className="text-xs text-stone-400">{semesterCode}</p>
             </div>
           </div>
           {courses.length > 0 && (
             <span className="text-xs font-bold text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
               {courses.length} مقرر
             </span>
           )}
         </div>
       </GlassCard>

       {isLoading && (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {Array.from({ length: COURSE_SKELETON_COUNT }).map((_, i) => (
             <GlassCard key={i} className="p-4 border-amber-700/30 shadow-[4px_4px_0px_0px_rgba(180,130,50,0.25)]">
               <Skeleton className="w-3/4 h-5 mb-2.5" />
               <Skeleton className="w-1/2 h-4 mb-3" />
               <Skeleton className="w-full h-10" />
             </GlassCard>
           ))}
         </div>
       )}

       {error && !isLoading && (
         <GlassCard className="p-5 flex flex-col items-center text-center border-rose-500/30">
           <div className="h-11 w-11 rounded-full bg-red-500/10 flex items-center justify-center mb-3">
             <Icon icon={AlertCircle} size="lg" className="text-red-400" />
           </div>
           <p className="text-red-400 text-sm mb-3">فشل تحميل المقررات</p>
           <Button variant="secondary" onClick={handleRetry} icon={<RefreshCw size={16} />}>
             إعادة المحاولة
           </Button>
         </GlassCard>
       )}

       {!isLoading && !error && courses.length === 0 && (
         <GlassCard className="p-6 flex flex-col items-center text-center border-amber-700/30 shadow-[4px_4px_0px_0px_rgba(180,130,50,0.25)]">
           <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center mb-3">
             <Icon icon={BookOpen} size="xl" className="text-stone-400" />
           </div>
           <h3 className="text-base font-bold text-stone-100 mb-1.5">لا توجد مقررات</h3>
           <p className="text-sm text-stone-400 max-w-sm mb-5">
             لم يتم العثور على مقررات للفصل الحالي. قم باستخراج جدولك الدراسي لعرض مقرراتك هنا.
           </p>
           <Button variant="primary" to="/dashboard/schedule" icon={<CalendarDays size={16} />}>
             استخراج الجدول
           </Button>
         </GlassCard>
       )}

      {!isLoading && !error && courses.length > 0 && (
        <div className="space-y-4">
          {mainCourses.map((course) => {
            const courseProgress = progress.find(p => p.course_code === course.full_code);
            return (
              <CourseSuggestionCard
                key={course.id}
                course={course}
                userProgress={courseProgress}
              />
            );
          })}

           {englishCourses.length > 0 && (
             <div className="mt-5 space-y-2.5">
               <h3 className="text-sm font-bold text-sky-400 flex items-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                 مواد اللغة الإنجليزية
               </h3>
              {englishCourses.map((course) => {
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

           {additionalCourses.length > 0 && (
             <div className="mt-5 space-y-2.5">
               <h3 className="text-sm font-bold text-orange-400 flex items-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                 المواد الإضافية
               </h3>
              {additionalCourses.map((course) => {
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
      )}
    </div>
  );
});
