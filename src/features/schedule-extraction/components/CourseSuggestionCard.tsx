'use client';

import { useMemo, useState } from 'react';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { Icon } from '@/src/components/ui/Icon';
import { Button } from '@/src/components/ui/Button';
import { Link } from 'react-router-dom';
import { useCourseSuggestions } from '../hooks/useCourseSuggestions';
import type { ExtractedCourseRecord, UserCourseProgress } from '@/src/types/database';
import {
  FileText,
  Users,
  BookMarked,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
} from 'lucide-react';

type ProgressStatus = 'passed' | 'carried' | 'failed' | 'none';

function getProgressStatus(progress: UserCourseProgress | undefined): ProgressStatus {
  if (!progress) return 'none';
  return progress.status;
}

function getProgressLabel(status: ProgressStatus): string {
  switch (status) {
    case 'passed':
      return 'ناجح';
    case 'carried':
      return 'ناقص';
    case 'failed':
      return 'راسب';
    default:
      return 'غير محدد';
  }
}

function getProgressColor(status: ProgressStatus): string {
  switch (status) {
    case 'passed':
      return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    case 'carried':
      return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    case 'failed':
      return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    default:
      return 'text-slate-400 bg-white/5 border-white/10';
  }
}

export function CourseSuggestionCard({
  course,
  defaultExpanded = false,
  userProgress,
}: {
  course: ExtractedCourseRecord;
  defaultExpanded?: boolean;
  userProgress?: UserCourseProgress | undefined;
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const { data: suggestions, isLoading: isLoadingSuggestions } = useCourseSuggestions(
    course.full_code,
    course.major,
    course.course_name,
    course.section,
    course.instructor_name,
  );

  const progressStatus = getProgressStatus(userProgress);
  const progressLabel = getProgressLabel(progressStatus);
  const progressColor = getProgressColor(progressStatus);

  const hasSuggestions = suggestions && (suggestions.tests.length > 0 || suggestions.studyGroups.length > 0 || suggestions.materials.length > 0);

  const personalizedTests = useMemo(() => {
    if (!suggestions) return [];
    if (progressStatus === 'passed') {
      return suggestions.tests.filter(t => t.rating && t.rating >= 4).slice(0, 3);
    }
    if (progressStatus === 'failed' || progressStatus === 'carried') {
      return suggestions.tests.slice(0, 3);
    }
    return suggestions.tests.slice(0, 5);
  }, [suggestions, progressStatus]);

  const personalizedGroups = useMemo(() => {
    if (!suggestions) return [];
    if (progressStatus === 'passed') {
      return suggestions.studyGroups.filter(g => g.current_members >= g.max_members * 0.8).slice(0, 3);
    }
    if (progressStatus === 'failed' || progressStatus === 'carried') {
      return suggestions.studyGroups.slice(0, 5);
    }
    return suggestions.studyGroups.slice(0, 5);
  }, [suggestions, progressStatus]);

  return (
    <GlassCard className="overflow-hidden">
      <div
        className="p-5 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setIsExpanded(prev => !prev)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="mt-0.5 flex-shrink-0 text-orange-400">
              <Icon icon={BookMarked} size="md" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="text-base font-bold text-white leading-tight">{course.course_name}</h3>
                {progressStatus !== 'none' && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${progressColor}`}>
                    {progressLabel}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-mono bg-white/5 px-2 py-0.5 rounded border border-white/8">{course.full_code}</span>
                {course.section && (
                  <span className="text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                    {course.section}
                  </span>
                )}
                {course.instructor_name && (
                  <span className="text-slate-400">الدكتور: {course.instructor_name}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {hasSuggestions && (
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                {personalizedTests.length + personalizedGroups.length + (suggestions?.materials.length ?? 0)} اقتراح
              </span>
            )}
            <button className="text-slate-400 hover:text-white transition-colors">
              {isExpanded ? <Icon icon={ChevronUp} size="sm" /> : <Icon icon={ChevronDown} size="sm" />}
            </button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-5 pb-5 border-t border-white/5">
          {isLoadingSuggestions ? (
            <div className="py-4 flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
              <p className="text-slate-400 text-xs font-bold">جاري تحميل الاقتراحات...</p>
            </div>
          ) : suggestions ? (
            <div className="pt-4 space-y-4">
              {progressStatus !== 'none' && (
                <div className={`p-3 rounded-xl border ${progressColor}`}>
                  <div className="flex items-center gap-2">
                    <Icon icon={progressStatus === 'passed' ? CheckCircle2 : AlertTriangle} size="sm" />
                    <span className="text-xs font-bold">
                      حالتك في هذه المادة: {progressLabel}
                    </span>
                  </div>
                  {progressStatus === 'failed' && (
                    <p className="text-[10px] mt-1 opacity-80">ننصحك بالتركيز على المواد الدراسية والمجموعات remedial</p>
                  )}
                  {progressStatus === 'carried' && (
                    <p className="text-[10px] mt-1 opacity-80">يمكنك الانضمام لمجموعات المراجعة والاختبارات التحصيلية</p>
                  )}
                  {progressStatus === 'passed' && (
                    <p className="text-[10px] mt-1 opacity-80">يمكنك مساعدة زملائك أو مراجعة مواد متقدمة</p>
                  )}
                </div>
              )}

              {personalizedTests.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-2">
                    <Icon icon={FileText} size="xs" className="text-orange-400" />
                    اختبارات متاحة
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {personalizedTests.map(test => (
                      <Link key={test.id} to={`/exam/play/${test.id}`}>
                        <Button variant="secondary" className="text-xs">
                          {test.title}
                        </Button>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {personalizedGroups.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-2">
                    <Icon icon={Users} size="xs" className="text-orange-400" />
                    مجموعات دراسية
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {personalizedGroups.map(group => (
                      <Link key={group.id} to={`/dashboard/study-groups`}>
                        <Button variant="secondary" className="text-xs">
                          {group.name} ({group.current_members}/{group.max_members})
                        </Button>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {suggestions.materials.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-2">
                    <Icon icon={BookMarked} size="xs" className="text-orange-400" />
                    مواد دراسية
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.materials.map(material => (
                      <a key={material.id} href={material.url} target="_blank" rel="noopener noreferrer">
                         <Button variant="secondary" className="text-xs flex items-center gap-1">
                          {material.title}
                          <ExternalLink size={10} />
                        </Button>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {!hasSuggestions && (
                <div className="flex items-center gap-2 text-slate-500 text-xs text-center py-2">
                  <Icon icon={BookOpen} size="xs" />
                  لا توجد اقتراحات متاحة حالياً
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}
    </GlassCard>
  );
}
