"use client";

import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

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
    const timer = setTimeout(() => onDismiss(t.id), 4000);
    return () => clearTimeout(timer);
  }, [t.id, onDismiss]);

  const icons = { success: <CheckCircle2 className="w-4 h-4 text-emerald-400" />, error: <AlertCircle className="w-4 h-4 text-rose-400" />, info: <Info className="w-4 h-4 text-cyan-400" /> };
  const borders = { success: 'border-emerald-500/30', error: 'border-rose-500/30', info: 'border-cyan-500/30' };

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--color-bg-primary)] border ${borders[t.type]} shadow-2xl shadow-black/40 min-w-[280px] max-w-sm`}>
      {icons[t.type]}
      <p className="text-white text-sm flex-1 leading-relaxed">{t.message}</p>
      <button onClick={() => onDismiss(t.id)} className="text-slate-400 hover:text-white transition-colors">
        <X className="w-4 h-4" />
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
