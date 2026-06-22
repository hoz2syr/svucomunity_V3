
/**
 * A Skeleton component used to simulate loading state for UI blocks.
 * It provides a pulsing animation to indicate content is being loaded.
 */
export const Skeleton = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`animate-pulse bg-white/5 rounded-xl ${className}`} />
  );
};

/**
 * Example of a card skeleton structure.
 */
export const CardSkeleton = () => {
  return (
    <div className="bg-[#0e1438]/50 border border-indigo-900/40 rounded-2xl p-8 flex flex-col items-center h-[280px]">
      <Skeleton className="w-16 h-16 rounded-2xl mb-6" />
      <Skeleton className="w-2/3 h-6 mb-4" />
      <Skeleton className="w-full h-16" />
    </div>
  );
};
