interface SkeletonGridProps {
  count?: number;
}

export function SkeletonGrid({ count = 6 }: SkeletonGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          data-testid="skeleton-item"
          className="rounded-2xl bg-slate-800/30 border border-white/10 p-6 h-48 animate-pulse"
        >
          <div className="space-y-4">
            <div className="h-7 w-24 bg-slate-700/60 rounded-lg" />
            <div className="h-6 w-3/4 bg-slate-700/60 rounded-lg" />
            <div className="h-5 w-20 bg-slate-700/40 rounded-md" />
            <div className="h-4 w-1/2 bg-slate-700/30 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
