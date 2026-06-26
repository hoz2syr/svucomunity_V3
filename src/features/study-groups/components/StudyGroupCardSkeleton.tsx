"use client";

interface StudyGroupCardSkeletonProps {
  count?: number;
}

export function StudyGroupCardSkeleton({ count = 1 }: StudyGroupCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 animate-pulse"
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="h-6 w-16 bg-white/10 rounded-lg" />
            <div className="h-6 w-16 bg-white/10 rounded-lg" />
          </div>
          <div className="h-5 w-3/4 bg-white/10 rounded mb-2" />
          <div className="h-4 w-1/2 bg-white/10 rounded mb-4" />
          <div className="flex justify-between text-xs mb-1.5">
            <div className="h-3 w-16 bg-white/10 rounded" />
            <div className="h-3 w-12 bg-white/10 rounded" />
          </div>
          <div className="h-1.5 bg-[var(--color-bg-elevated)]/80 rounded-full overflow-hidden">
            <div className="h-full bg-white/10 rounded-full" style={{ width: '60%' }} />
          </div>
        </div>
      ))}
    </>
  );
}
