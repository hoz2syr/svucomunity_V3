"use client";

interface ProgressBarProps {
  current: number;
  max: number;
  size?: 'sm' | 'md';
  className?: string;
}

export function ProgressBar({ current, max, size = 'md', className = '' }: ProgressBarProps) {
  const isFull = current >= max;
  const progress = (current / max) * 100;

  return (
    <div className={className}>
      <div className={`flex justify-between ${size === 'sm' ? 'text-xs' : 'text-sm'} mb-2`}>
        <span className="text-slate-400">عدد الأعضاء</span>
        <span className={isFull ? 'text-rose-400' : 'text-white font-semibold'}>
          {current} / {max}
        </span>
      </div>
      <div className={`${size === 'sm' ? 'h-1.5' : 'h-2'} bg-slate-800/80 rounded-full overflow-hidden`}>
        <div
          className={`
            h-full rounded-full
            ${size === 'sm' ? 'transition-all duration-500 ease-out' : 'transition-all duration-500'}
            ${isFull ? 'bg-rose-500' : 'bg-gradient-to-r from-cyan-500 to-indigo-500'}
          `}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      {size !== 'sm' && (
        <p className={`text-xs text-center mt-2 ${isFull ? 'text-rose-400' : 'text-emerald-400'}`}>
          {isFull ? '● ممتلئة - لا يمكن الانضمام' : '● متاحة - يمكن الانضمام'}
        </p>
      )}
    </div>
  );
}
