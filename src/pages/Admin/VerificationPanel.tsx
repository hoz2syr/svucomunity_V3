'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { Button } from '@/src/components/ui/Button';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { Icon } from '@/src/components/ui/Icon';
import {
  useUnverifiedCourses,
  useUnverifiedInstructors,
  useVerifyCourse,
  useVerifyInstructor,
} from '../../features/admin/hooks/useAdminVerification';
import { CheckCircle2, XCircle, BookOpen, User, Search, Shield, AlertTriangle, RefreshCw } from 'lucide-react';

type Tab = 'courses' | 'instructors';
type ConfirmAction = { type: 'course'; courseCode: string; isVerified: boolean; courseName: string } | { type: 'instructor'; instructorUsername: string; isVerified: boolean; instructorName: string };

export function VerificationPanel() {
  const { session: _session, profile, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('courses');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMajor, setSelectedMajor] = useState<string>('all');
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [coursesPage, setCoursesPage] = useState(1);
  const [instructorsPage, setInstructorsPage] = useState(1);
  const limit = 50;

  const isAdmin = profile?.role === 'admin';

  const {
    data: courses,
    isLoading: coursesLoading,
    error: coursesError,
    refetch: refetchCourses,
  } = useUnverifiedCourses(activeTab === 'courses' ? coursesPage : 1, limit);

  const {
    data: instructors,
    isLoading: instructorsLoading,
    error: instructorsError,
    refetch: refetchInstructors,
  } = useUnverifiedInstructors(activeTab === 'instructors' ? instructorsPage : 1, limit);

  const verifyCourseMutation = useVerifyCourse();
  const verifyInstructorMutation = useVerifyInstructor();

  const _isLoading = authLoading || (activeTab === 'courses' ? coursesLoading : instructorsLoading);
  const error = activeTab === 'courses' ? coursesError : instructorsError;

  const filteredCourses = useMemo(() => {
    if (!courses) return [];
    return courses.filter((course) => {
      const matchesSearch =
        course.course_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.course_code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMajor = selectedMajor === 'all' || course.major === selectedMajor;
      return matchesSearch && matchesMajor;
    });
  }, [courses, searchQuery, selectedMajor]);

  const uniqueMajors = useMemo(() => {
    if (!courses) return [];
    return Array.from(new Set(courses.map((c) => c.major))).sort();
  }, [courses]);

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

  const handleConfirmCourse = () => {
    if (!confirmAction || confirmAction.type !== 'course') return;
    verifyCourseMutation.mutate(
      { courseCode: confirmAction.courseCode, isVerified: confirmAction.isVerified },
      { onSuccess: () => setConfirmAction(null) }
    );
  };

  const handleConfirmInstructor = () => {
    if (!confirmAction || confirmAction.type !== 'instructor') return;
    verifyInstructorMutation.mutate(
      { instructorUsername: confirmAction.instructorUsername, isVerified: confirmAction.isVerified },
      { onSuccess: () => setConfirmAction(null) }
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="text-center space-y-2 pt-4">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          لوحة تحقق المشرف
        </h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
          تحقق من المواد والمحاضرين المستخرجين من الجداول الدراسية
        </p>
      </div>

      <div className="flex items-center gap-2 border-b border-white/10">
        <button
          type="button"
          onClick={() => setActiveTab('courses')}
          className={`px-4 py-3 text-sm font-medium transition-all ${
            activeTab === 'courses'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          المواد
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('instructors')}
          className={`px-4 py-3 text-sm font-medium transition-all ${
            activeTab === 'instructors'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          المحاضرين
        </button>
      </div>

      {error && (
        <GlassCard className="p-4 border-rose-500/30">
          <div className="flex items-center gap-2 text-rose-400">
            <Icon icon={AlertTriangle} size="sm" />
            <span className="text-sm">{error instanceof Error ? error.message : 'حدث خطأ'}</span>
          </div>
          <Button
            variant="secondary"
            className="mt-3 text-xs"
            onClick={() =>
              activeTab === 'courses' ? refetchCourses() : refetchInstructors()
            }
          >
            <Icon icon={RefreshCw} size="xs" />
            إعادة المحاولة
          </Button>
        </GlassCard>
      )}

      {activeTab === 'courses' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Icon icon={Search} size="sm" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="بحث عن مادة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
            <select
              value={selectedMajor}
              onChange={(e) => setSelectedMajor(e.target.value)}
              className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500/50"
            >
              <option value="all">كل التخصصات</option>
              {uniqueMajors.map((major) => (
                <option key={major} value={major}>
                  {major}
                </option>
              ))}
            </select>
          </div>

          {coursesLoading ? (
            <div className="grid gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <GlassCard key={i} className="p-5">
                  <Skeleton className="w-full h-20" />
                </GlassCard>
              ))}
            </div>
          ) : filteredCourses.length === 0 ? (
            <GlassCard className="p-8 text-center">
              <Icon icon={CheckCircle2} size="xl" className="text-emerald-400 mb-3" />
              <p className="text-slate-400 text-sm">لا توجد مواد غير محققة</p>
            </GlassCard>
          ) : (
            <div className="grid gap-4">
              {filteredCourses.map((course) => (
                <GlassCard key={course.course_code} className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon icon={BookOpen} size="sm" className="text-cyan-400 shrink-0" />
                        <h3 className="text-white font-medium truncate">{course.course_name}</h3>
                        <span className="text-xs text-slate-500 font-mono">{course.course_code}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="px-2 py-0.5 bg-white/5 rounded-lg">{course.major}</span>
                        <span>الظهور: {course.seen_count}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="primary"
                        onClick={() =>
                          setConfirmAction({ type: 'course', courseCode: course.course_code, isVerified: true, courseName: course.course_name })
                        }
                        disabled={verifyCourseMutation.isPending}
                      >
                        <Icon icon={CheckCircle2} size="xs" />
                        تحقق
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() =>
                          setConfirmAction({ type: 'course', courseCode: course.course_code, isVerified: false, courseName: course.course_name })
                        }
                        disabled={verifyCourseMutation.isPending}
                      >
                        <Icon icon={XCircle} size="xs" />
                        رفض
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
          {!coursesLoading && filteredCourses.length > 0 && (
            <div className="flex items-center justify-between">
              <Button
                variant="secondary"
                onClick={() => setCoursesPage((p) => Math.max(1, p - 1))}
                disabled={coursesPage === 1}
              >
                السابق
              </Button>
              <span className="text-sm text-slate-400">صفحة {coursesPage}</span>
              <Button
                variant="secondary"
                onClick={() => setCoursesPage((p) => p + 1)}
                disabled={filteredCourses.length < limit}
              >
                التالي
              </Button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'instructors' && (
        <div className="space-y-4">
          {instructorsLoading ? (
            <div className="grid gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <GlassCard key={i} className="p-5">
                  <Skeleton className="w-full h-20" />
                </GlassCard>
              ))}
            </div>
          ) : !instructors || instructors.length === 0 ? (
            <GlassCard className="p-8 text-center">
              <Icon icon={CheckCircle2} size="xl" className="text-emerald-400 mb-3" />
              <p className="text-slate-400 text-sm">لا يوجد محاضرين غير محققين</p>
            </GlassCard>
          ) : (
            <div className="grid gap-4">
              {instructors.map((instructor) => (
                <GlassCard key={instructor.instructor_username} className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon icon={User} size="sm" className="text-cyan-400 shrink-0" />
                        <h3 className="text-white font-medium truncate">{instructor.full_name}</h3>
                        <span className="text-xs text-slate-500 font-mono">{instructor.instructor_username}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span>الظهور: {instructor.seen_count}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="primary"
                        onClick={() =>
                          setConfirmAction({ type: 'instructor', instructorUsername: instructor.instructor_username, isVerified: true, instructorName: instructor.full_name })
                        }
                        disabled={verifyInstructorMutation.isPending}
                      >
                        <Icon icon={CheckCircle2} size="xs" />
                        تحقق
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() =>
                          setConfirmAction({ type: 'instructor', instructorUsername: instructor.instructor_username, isVerified: false, instructorName: instructor.full_name })
                        }
                        disabled={verifyInstructorMutation.isPending}
                      >
                        <Icon icon={XCircle} size="xs" />
                        رفض
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
          {!instructorsLoading && instructors && instructors.length > 0 && (
            <div className="flex items-center justify-between">
              <Button
                variant="secondary"
                onClick={() => setInstructorsPage((p) => Math.max(1, p - 1))}
                disabled={instructorsPage === 1}
              >
                السابق
              </Button>
              <span className="text-sm text-slate-400">صفحة {instructorsPage}</span>
              <Button
                variant="secondary"
                onClick={() => setInstructorsPage((p) => p + 1)}
                disabled={instructors.length < limit}
              >
                التالي
              </Button>
            </div>
          )}
        </div>
      )}

      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmAction(null)} />
          <GlassCard className="relative z-10 w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-white mb-2">
              {confirmAction.isVerified ? 'تأكيد التحقق' : 'تأكيد الرفض'}
            </h2>
            <p className="text-sm text-slate-400 mb-6">
              {confirmAction.type === 'course' ? (
                <>
                  هل أنت متأكد من {confirmAction.isVerified ? 'تحقق' : 'رفض'} المادة{' '}
                  <span className="text-white font-medium">{confirmAction.courseName}</span>؟
                </>
              ) : (
                <>
                  هل أنت متأكد من {confirmAction.isVerified ? 'تحقق' : 'رفض'} المحاضر{' '}
                  <span className="text-white font-medium">{confirmAction.instructorName}</span>؟
                </>
              )}
            </p>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => setConfirmAction(null)}
                disabled={confirmAction.type === 'course' ? verifyCourseMutation.isPending : verifyInstructorMutation.isPending}
                className="flex-1"
              >
                إلغاء
              </Button>
              <Button
                variant={confirmAction.isVerified ? 'primary' : 'danger'}
                onClick={confirmAction.type === 'course' ? handleConfirmCourse : handleConfirmInstructor}
                disabled={confirmAction.type === 'course' ? verifyCourseMutation.isPending : verifyInstructorMutation.isPending}
                className="flex-1"
              >
                {confirmAction.type === 'course' ? (verifyCourseMutation.isPending ? 'جاري التنفيذ...' : 'تأكيد') : (verifyInstructorMutation.isPending ? 'جاري التنفيذ...' : 'تأكيد')}
              </Button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
