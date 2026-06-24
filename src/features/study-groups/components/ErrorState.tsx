"use client";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({
  title = 'حدث خطأ في التحميل',
  message,
  onRetry,
  retryLabel = 'إعادة المحاولة',
}: ErrorStateProps) {
  return (
    <div className="text-center py-20">
      <div className="text-5xl mb-4">⚠️</div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400 mb-4 text-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="
            px-6 py-2.5 rounded-xl text-sm font-medium
            bg-cyan-600 hover:bg-cyan-500 text-white
            shadow-[0_0_20px_rgba(6,182,212,0.25)]
            hover:shadow-[0_0_28px_rgba(6,182,212,0.4)]
            transition-all duration-200
          "
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
}
