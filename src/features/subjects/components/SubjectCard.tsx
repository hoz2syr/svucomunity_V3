import type { ComponentType, SVGProps } from 'react';
import type { Subject } from '../src/types';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { Icon } from '@/src/components/ui/Icon';
import { Button } from '@/src/components/ui/Button';
import { Link } from 'react-router-dom';

type SubjectCardProps = {
  course: Subject;
  isCurrentSemester?: boolean;
};

export function SubjectCard({ course, isCurrentSemester }: SubjectCardProps) {
  const levelLabel = typeof course.level === 'number' ? `السنة ${course.level}` : course.level;

  return (
    <GlassCard className="flex flex-col h-full">
      {isCurrentSemester && (
        <Link to={`/dashboard/subjects/${course.id}`} className="absolute top-2 right-2 z-20">
          <span className="text-[10px] font-bold text-cyan-300 bg-cyan-500/15 border border-cyan-500/25 px-2 py-0.5 rounded-full backdrop-blur-sm hover:bg-cyan-500/25 transition-colors cursor-pointer">
            مادة هذا الفصل
          </span>
        </Link>
      )}
      <div className="p-5 flex flex-col h-full">
        <div className="flex items-start gap-3 mb-3">
          {course.icon && (
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 shrink-0">
              <Icon icon={course.icon as unknown as ComponentType<SVGProps<SVGSVGElement>>} size="lg" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-base leading-tight mb-1 truncate">{course.name}</h3>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>{levelLabel}</span>
              <span className="w-1 h-1 rounded-full bg-slate-500" />
              <span>{course.credits} ساعة</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
          <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/8">
            {course.diff === 1 ? 'سهل' : course.diff === 2 ? 'متوسط' : 'صعب'}
          </span>
          {course.prereqs.length > 0 && (
            <span className="truncate">المتطلبات: {course.prereqs.length}</span>
          )}
        </div>

        <div className="mt-auto pt-3 border-t border-white/6">
          <Link to={`/dashboard/subjects/${course.id}`}>
            <Button variant="secondary" className="w-full text-sm">
              عرض التفاصيل
            </Button>
          </Link>
        </div>
      </div>
    </GlassCard>
  );
}
