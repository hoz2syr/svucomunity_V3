import { Handle, Position } from '@xyflow/react';
import type { Course, SpecializationCourse, CourseState } from '../types';
import { BookOpen, CheckCircle, Lock, Unlock } from 'lucide-react';
import { useCallback, useState, useRef, useEffect } from 'react';

interface CourseNodeProps {
  data: {
    course: Course | SpecializationCourse;
    state: CourseState;
    isSelected: boolean;
    isPrereq: boolean;
    isSuccessor: boolean;
    isDimmed: boolean;
    simulatorMode: boolean;
    onClick: (code: string) => void;
  };
}

const stateConfig: Record<CourseState, { bg: string; border: string; text: string; Icon: typeof BookOpen }> = {
  passed: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
    text: 'text-emerald-700',
    Icon: CheckCircle,
  },
  available: {
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    text: 'text-blue-700',
    Icon: Unlock,
  },
  locked: {
    bg: 'bg-gray-100',
    border: 'border-gray-300',
    text: 'text-gray-500',
    Icon: Lock,
  },
};

export function CourseNode({ data }: CourseNodeProps) {
  const { course, state, isSelected, isPrereq, isSuccessor, isDimmed, simulatorMode, onClick } = data;

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(course.code);
    }
  }, [onClick, course.code]);

  const courseLabel = `${course.name_ar} — ${course.code}`;
  const [measuredWidth, setMeasuredWidth] = useState(0);
  const nodeRef = useRef<HTMLDivElement>(null);
  const targetWidth = 220;
  const targetHeight = 120;

  useEffect(() => {
    if (nodeRef.current) {
      setMeasuredWidth(nodeRef.current.scrollWidth);
    }
  }, [course.code, isSelected, simulatorMode]);

  const dynamicWidth = Math.max(targetWidth, measuredWidth + 20);

  const config = stateConfig[state] ?? stateConfig.locked;
  const Icon = config.Icon;

  const opacity = isDimmed ? 'opacity-40' : 'opacity-100';
  const handleOpacity = isDimmed ? 'opacity-25' : '';
  const transform = isSelected ? 'scale-105 shadow-lg' : '';
  const zIndex = isSelected ? 'z-10' : 'z-0';

  const isSpecializationCourse = (course: Course | SpecializationCourse): course is SpecializationCourse =>
    !('year' in course);

  return (
    <div
      dir="rtl"
      ref={nodeRef}
      tabIndex={0}
      role="button"
      aria-label={courseLabel}
      aria-pressed={simulatorMode ? (state === 'passed' ? 'true' : 'false') : undefined}
      onKeyDown={handleKeyDown}
      onClick={() => onClick(course.code)}
      style={{ minWidth: dynamicWidth }}
      className={`
        relative rounded-xl border-2 p-3 shadow-sm
        transition-all duration-300 cursor-pointer
        ${config.bg} ${config.border} ${opacity} ${transform} ${zIndex}
        focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2
      `}
    >
      <Handle type="target" position={Position.Right} className={`w-2 h-2 !bg-gray-400 !border-white ${handleOpacity}`} />

      <div className="flex items-start justify-between mb-2">
        <span className={`text-xs font-bold px-2 py-1 rounded-md bg-white/60 ${config.text}`}>
          {course.code}
        </span>
        <Icon size={16} className={config.text} />
      </div>

      <h3 className={`font-bold text-sm leading-tight mb-2 ${config.text}`}>
        {course.name_ar}
      </h3>

      <div className="flex items-center justify-between text-xs text-gray-500 mt-auto">
        <span>{course.credits} ساعات</span>
        {isSpecializationCourse(course) && <span>سنة {course.year}</span>}
      </div>

      <Handle type="source" position={Position.Left} className={`w-2 h-2 !bg-gray-400 !border-white ${handleOpacity}`} />
    </div>
  );
}
