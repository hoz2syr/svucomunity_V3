'use client';

import { useState } from 'react';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { Button } from '@/src/components/ui/Button';
import { Link } from 'react-router-dom';
import type { ExtractedCourseRecord, UserCourseProgress } from '@/src/types/database';
import {
  BookMarked,
  ChevronDown,
  ChevronUp,
  Users,
  FileText,
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

  const progressStatus = getProgressStatus(userProgress);
  const progressLabel = getProgressLabel(progressStatus);
  const progressColor = getProgressColor(progressStatus);

  return (
    <GlassCard className="overflow-hidden">
      <div
        className="p-5 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setIsExpanded(prev => !prev)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="mt-0.5 flex-shrink-0 text-orange-400">
              <BookMarked size={20} />
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
            <button className="text-slate-400 hover:text-white transition-colors">
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-5 pb-5 border-t border-white/5">
          <div className="pt-4 flex flex-wrap gap-2">
            <Link to={`/dashboard/study-groups?course_code=${encodeURIComponent(course.full_code)}`}>
              <Button variant="secondary" className="text-xs flex items-center gap-1.5">
                <Users size={14} />
                البحث عن مجموعات دراسية
              </Button>
            </Link>
            <Link to={`/dashboard/subjects/${encodeURIComponent(course.full_code)}`}>
              <Button variant="secondary" className="text-xs flex items-center gap-1.5">
                <BookMarked size={14} />
                مصادر دراسية
              </Button>
            </Link>
            <Link to={`/exam/browse?course_code=${encodeURIComponent(course.full_code)}`}>
              <Button variant="secondary" className="text-xs flex items-center gap-1.5">
                <FileText size={14} />
                اختبارات
              </Button>
            </Link>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
