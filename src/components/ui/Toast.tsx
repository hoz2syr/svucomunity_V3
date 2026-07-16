"use client";

import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { Icon } from '@/src/components/ui/Icon';
import { TOAST_AUTO_DISMISS_MS } from '@/src/lib/constants';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

function ToastItem({ toast: t, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(t.id), TOAST_AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [t.id, onDismiss]);

  const iconColor = {
    success: 'text-emerald-400',
    error: 'text-rose-400',
    info: 'text-cyan-400',
  };

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--color-bg-primary)] border shadow-2xl shadow-black/40 min-w-[280px] max-w-sm ${
      t.type === 'success' ? 'border-emerald-500/30' : t.type === 'error' ? 'border-rose-500/30' : 'border-cyan-500/30'
    }`}>
      {t.type === 'success' && <Icon icon={CheckCircle2} size="sm" className={iconColor.success} aria-label="نجاح" />}
      {t.type === 'error' && <Icon icon={AlertCircle} size="sm" className={iconColor.error} aria-label="خطأ" />}
      {t.type === 'info' && <Icon icon={Info} size="sm" className={iconColor.info} aria-label="معلومات" />}
      <p className="text-white text-sm flex-1 leading-relaxed">{t.message}</p>
      <button onClick={() => onDismiss(t.id)} className="text-slate-400 hover:text-white transition-colors" aria-label="إغلاق">
        <Icon icon={X} size="sm" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `toast-${++counterRef.current}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    return id;
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      {toasts.length > 0 && (
        <div className="fixed bottom-6 left-6 z-[9999] flex flex-col gap-2">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}
