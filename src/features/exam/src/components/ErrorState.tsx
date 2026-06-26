"use client";

import { AlertTriangle, RefreshCcw } from 'lucide-react';

export function ErrorState({ title = 'حدث خطأ غير متوقع', message, onRetry }: { title?: string, message: string, onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] w-full animation-fade-in px-4">
      <div className="glass-card flex flex-col items-center max-w-md w-full text-center p-8 border-[var(--color-danger-border)]">
        <div className="w-16 h-16 bg-[var(--color-danger-light)] rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8 text-[var(--color-danger)]" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-secondary-400 mb-8 leading-relaxed">{message}</p>
        
        {onRetry && (
           <button onClick={onRetry} className="btn-danger w-full flex justify-center items-center gap-2">
             <RefreshCcw className="w-5 h-5" />
             <span>إعادة المحاولة</span>
           </button>
        )}
      </div>
    </div>
  );
}
