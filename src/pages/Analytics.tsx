'use client';

import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, User, GraduationCap, TrendingUp, ArrowLeft, ShieldX } from 'lucide-react';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { Button } from '@/src/components/ui/Button';
import { Icon } from '@/src/components/ui/Icon';
import { useAuth } from '@/src/contexts/AuthContext';
import { usePopularCourses, usePopularInstructors, useMajorDistribution } from '@/src/features/schedule-extraction/hooks/useAnalytics';
import type { DiscoveredCourse, DiscoveredInstructor, DiscoveredMajor } from '@/src/types/database';

const SKELETON_COUNT = 5;

const StatCard = React.memo(function StatCard({ title, value, icon, isLoading }: { title: string; value: number | string; icon: React.ReactNode; isLoading?: boolean }) {
  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg">
          {icon}
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</span>
          {isLoading ? (
            <Skeleton className="w-16 h-8" />
          ) : (
            <span className="text-2xl font-black text-white">{typeof value === 'number' ? value.toLocaleString('ar-SA') : value}</span>
          )}
        </div>
      </div>
    </GlassCard>
  );
});

const PopularCoursesTable = React.memo(function PopularCoursesTable() {
  const { data: courses, isLoading, error } = usePopularCourses(20);

  if (isLoading) {
    return (
      <GlassCard className="p-6">
        <h3 className="text-lg font-extrabold text-white mb-4 flex items-center gap-2">
          <Icon icon={BookOpen} size="md" />
          المواد الأكثر ظهوراً
        </h3>
        <div className="space-y-3">
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <div className="flex items-center gap-3 flex-1">
                <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                <div className="flex flex-col gap-2 flex-1">
                  <Skeleton className="w-32 h-4" />
                  <Skeleton className="w-20 h-3" />
                </div>
              </div>
              <Skeleton className="w-12 h-4" />
            </div>
          ))}
        </div>
      </GlassCard>
    );
  }

  if (error) {
    return (
      <GlassCard className="p-6">
        <h3 className="text-lg font-extrabold text-white mb-4 flex items-center gap-2">
          <Icon icon={BookOpen} size="md" />
          المواد الأكثر ظهوراً
        </h3>
        <div className="text-center py-8 text-slate-400">حدث خطأ في تحميل البيانات</div>
      </GlassCard>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <GlassCard className="p-6">
        <h3 className="text-lg font-extrabold text-white mb-4 flex items-center gap-2">
          <Icon icon={BookOpen} size="md" />
          المواد الأكثر ظهوراً
        </h3>
        <div className="text-center py-8 text-slate-400">لا توجد بيانات متاحة حالياً</div>
      </GlassCard>
    );
  }

  const _maxCount = courses.length > 0 ? Math.max(...courses.map((c: DiscoveredCourse) => c.seen_count)) : 1;

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-extrabold text-white mb-4 flex items-center gap-2">
        <Icon icon={BookOpen} size="md" />
        المواد الأكثر ظهوراً
      </h3>
      <div className="space-y-3">
        {courses.map((course: DiscoveredCourse, index: number) => (
          <div
            key={course.course_code + course.section}
            className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/8 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 text-xs font-black">
                {index + 1}
              </span>
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-sm font-bold text-white truncate">{course.course_name}</span>
                <span className="text-xs text-slate-400 truncate">{course.course_code} - {course.major}</span>
              </div>
            </div>
            <span className="text-xs font-bold text-cyan-400 shrink-0 mr-2">{course.seen_count}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
});

const PopularInstructorsTable = React.memo(function PopularInstructorsTable() {
  const { data: instructors, isLoading, error } = usePopularInstructors(20);

  if (isLoading) {
    return (
      <GlassCard className="p-6">
        <h3 className="text-lg font-extrabold text-white mb-4 flex items-center gap-2">
          <Icon icon={User} size="md" />
          الأساتذة الأكثر ظهوراً
        </h3>
        <div className="space-y-3">
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <div className="flex items-center gap-3 flex-1">
                <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                <Skeleton className="w-32 h-4" />
              </div>
              <Skeleton className="w-12 h-4" />
            </div>
          ))}
        </div>
      </GlassCard>
    );
  }

  if (error) {
    return (
      <GlassCard className="p-6">
        <h3 className="text-lg font-extrabold text-white mb-4 flex items-center gap-2">
          <Icon icon={User} size="md" />
          الأساتذة الأكثر ظهوراً
        </h3>
        <div className="text-center py-8 text-slate-400">حدث خطأ في تحميل البيانات</div>
      </GlassCard>
    );
  }

  if (!instructors || instructors.length === 0) {
    return (
      <GlassCard className="p-6">
        <h3 className="text-lg font-extrabold text-white mb-4 flex items-center gap-2">
          <Icon icon={User} size="md" />
          الأساتذة الأكثر ظهوراً
        </h3>
        <div className="text-center py-8 text-slate-400">لا توجد بيانات متاحة حالياً</div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-extrabold text-white mb-4 flex items-center gap-2">
        <Icon icon={User} size="md" />
        الأساتذة الأكثر ظهوراً
      </h3>
      <div className="space-y-3">
        {instructors.map((instructor: DiscoveredInstructor, index: number) => (
          <div
            key={instructor.instructor_username}
            className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/8 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-black">
                {index + 1}
              </span>
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-sm font-bold text-white truncate">{instructor.full_name}</span>
                <span className="text-xs text-slate-400 truncate">@{instructor.instructor_username}</span>
              </div>
            </div>
            <span className="text-xs font-bold text-indigo-400 shrink-0 mr-2">{instructor.seen_count}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
});

const MajorDistributionList = React.memo(function MajorDistributionList() {
  const { data: majors, isLoading, error } = useMajorDistribution();

  if (isLoading) {
    return (
      <GlassCard className="p-6">
        <h3 className="text-lg font-extrabold text-white mb-4 flex items-center gap-2">
          <Icon icon={GraduationCap} size="md" />
          توزيع التخصصات
        </h3>
        <div className="space-y-3">
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-24 h-4" />
              <div className="flex-1 h-2 rounded-full bg-white/5">
                <Skeleton className="h-2 rounded-full" />
              </div>
              <Skeleton className="w-8 h-4" />
            </div>
          ))}
        </div>
      </GlassCard>
    );
  }

  if (error) {
    return (
      <GlassCard className="p-6">
        <h3 className="text-lg font-extrabold text-white mb-4 flex items-center gap-2">
          <Icon icon={GraduationCap} size="md" />
          توزيع التخصصات
        </h3>
        <div className="text-center py-8 text-slate-400">حدث خطأ في تحميل البيانات</div>
      </GlassCard>
    );
  }

  if (!majors || majors.length === 0) {
    return (
      <GlassCard className="p-6">
        <h3 className="text-lg font-extrabold text-white mb-4 flex items-center gap-2">
          <Icon icon={GraduationCap} size="md" />
          توزيع التخصصات
        </h3>
        <div className="text-center py-8 text-slate-400">لا توجد بيانات متاحة حالياً</div>
      </GlassCard>
    );
  }

  const maxCount = majors.length > 0 ? Math.max(...majors.map((m: DiscoveredMajor) => m.seen_count)) : 1;

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-extrabold text-white mb-4 flex items-center gap-2">
        <Icon icon={GraduationCap} size="md" />
        توزيع التخصصات
      </h3>
      <div className="space-y-4">
        {majors.map((major: DiscoveredMajor) => {
          const percentage = Math.round((major.seen_count / maxCount) * 100);
          return (
            <div key={major.major_code} className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white truncate">
                  {major.major_name_ar || major.major_name_en || major.major_code}
                </span>
                <span className="text-xs font-bold text-cyan-400 shrink-0 mr-2">{major.seen_count}</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
});

export function AnalyticsPage() {
  const { profile, loading: authLoading } = useAuth();
  const isAdmin = profile?.role === 'admin';

  const { data: courses } = usePopularCourses(20);
  const { data: instructors } = usePopularInstructors(20);
  const { data: majors } = useMajorDistribution();

  if (!authLoading && !isAdmin) {
    return (
      <div className="flex-1 p-6 lg:p-12 relative z-10 w-full h-full mt-20">
        <div className="max-w-7xl mx-auto">
          <GlassCard className="p-12 text-center">
            <Icon icon={ShieldX} size="lg" className="text-slate-400 mx-auto mb-4" />
            <h2 className="text-xl font-black text-white mb-2">غير مصرح بالوصول</h2>
            <p className="text-slate-400">هذه الصفحة مخصصة للمشرفين فقط</p>
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 lg:p-12 relative z-10 w-full h-full mt-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/dashboard">
            <Button variant="ghost" icon={<ArrowLeft size={16} />}>
              العودة للوحة التحكم
            </Button>
          </Link>
        </div>

        <div className="mb-10">
          <h1 className="text-3xl font-black text-white tracking-tight mb-2 flex items-center gap-3">
            <Icon icon={TrendingUp} size="lg" />
            التحليلات والإحصائيات
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            تحليل شامل للبيانات المستخرجة من الجداول الدراسية
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-7 mb-10">
          <StatCard
            title="إجمالي المواد"
            value={courses?.length ?? 0}
            icon={<BookOpen size={24} />}
          />
          <StatCard
            title="إجمالي الأساتذة"
            value={instructors?.length ?? 0}
            icon={<User size={24} />}
          />
          <StatCard
            title="إجمالي التخصصات"
            value={majors?.length ?? 0}
            icon={<GraduationCap size={24} />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-7 mb-10">
          <PopularCoursesTable />
          <PopularInstructorsTable />
        </div>

        <div className="grid grid-cols-1 gap-5 lg:gap-7">
          <MajorDistributionList />
        </div>
      </div>
    </div>
  );
}
