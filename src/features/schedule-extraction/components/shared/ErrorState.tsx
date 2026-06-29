"use client";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({
  title = "حدث خطأ في التحميل",
  message,
  onRetry,
  retryLabel = "إعادة المحاولة",
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
            bg-indigo-600 hover:bg-indigo-500 text-white
            shadow-md hover:shadow-lg
            transition-all duration-200
          "
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
}
