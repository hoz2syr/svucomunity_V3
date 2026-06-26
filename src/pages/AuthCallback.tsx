import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { completeAuthCallback } from '../services/auth.service';

export const AuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [message, setMessage] = useState('جاري تسجيل الدخول...');
  const [retryKey, setRetryKey] = useState(0);
  const [autoRetryCount, setAutoRetryCount] = useState(0);
  const MAX_AUTO_RETRIES = 2;

  useEffect(() => {
    const controller = new AbortController();

    const runCallback = async () => {
      try {
        const result = await completeAuthCallback();
        if (controller.signal.aborted) return;

        if (result.error && !result.data?.session) {
          setStatus('error');
          setMessage(result.error.message || 'حدث خطأ أثناء تسجيل الدخول.');
          return;
        }
        navigate('/dashboard', { replace: true });
      } catch (err) {
        if (controller.signal.aborted) return;
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'حدث خطأ أثناء تسجيل الدخول.');
      }
    };

    const timeoutId = window.setTimeout(() => {
      if (!controller.signal.aborted) {
        setStatus('error');
        setMessage('انتهت المهلة. يرجى المحاولة مرة أخرى.');
      }
    }, 30000);

    runCallback();

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [navigate, retryKey]);

  useEffect(() => {
    if (status === 'error' && autoRetryCount < MAX_AUTO_RETRIES) {
      const delay = Math.min(1000 * Math.pow(2, autoRetryCount), 5000);
      const timer = window.setTimeout(() => {
        setAutoRetryCount(c => c + 1);
        setRetryKey(k => k + 1);
        setStatus('loading');
        setMessage('جاري إعادة المحاولة تلقائياً...');
      }, delay);
      return () => window.clearTimeout(timer);
    }
  }, [status, autoRetryCount]);

  const handleRetry = () => {
    setRetryKey((k) => k + 1);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--color-bg-primary)] flex-col gap-4 px-4">
       <div className={`text-lg ${status === 'error' ? 'text-[var(--color-danger-400)]' : 'text-[var(--color-info-400)]'}`}>
        {message}
      </div>
      {status === 'error' && (
        <div className="flex flex-col items-center gap-3">
          <span className="text-slate-500 text-sm">يمكنك المحاولة مرة أخرى أو العودة للرئيسية</span>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-[var(--color-info-light)] hover:bg-[var(--color-info-light)] text-[var(--color-info-400)] border border-[var(--color-info-border)] rounded-lg text-sm transition-colors"
          >
            إعادة المحاولة
          </button>
          <button
            onClick={() => navigate('/login', { replace: true })}
            className="px-4 py-2 bg-slate-500/20 hover:bg-slate-500/30 text-slate-400 border border-slate-500/30 rounded-lg text-sm transition-colors"
          >
            العودة لتسجيل الدخول
          </button>
        </div>
      )}
    </div>
  );
};
