import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  icon?: 'error' | 'warning' | 'info';
}

export function ErrorState({
  title = 'حدث خطأ',
  message,
  onRetry,
  retryLabel = 'إعادة المحاولة',
  icon = 'error',
}: ErrorStateProps) {
  const iconColors: Record<string, string> = {
    error: 'text-red-400',
    warning: 'text-amber-400',
    info: 'text-blue-400',
  };

  return (
    <div className="text-center py-8">
      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4 ${iconColors[icon]}`}>
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400 mb-6 text-sm max-w-md mx-auto">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="
            inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium
            bg-teal-600 hover:bg-teal-500 text-white
            shadow-md hover:shadow-lg
            transition-all duration-200
          "
        >
          <RefreshCw className="w-4 h-4" />
          {retryLabel}
        </button>
      )}
    </div>
  );
}
