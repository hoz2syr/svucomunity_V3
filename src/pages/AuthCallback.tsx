import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { completeAuthCallback } from '../services/auth.service';

export const AuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [message, setMessage] = useState('جاري تسجيل الدخول...');
  const timerRef = useRef<number | null>(null);
  const redirectRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);
  const retryCountRef = useRef(0);

  const runCallback = async () => {
    try {
      const result = await completeAuthCallback();
      if (!isMountedRef.current) return;
      if (timerRef.current) window.clearTimeout(timerRef.current);
      if (redirectRef.current) window.clearTimeout(redirectRef.current);
      if (result.error) {
        if (result.data?.session) {
          navigate('/dashboard', { replace: true });
          return;
        }
        setStatus('error');
        setMessage(result.error.message || 'حدث خطأ أثناء تسجيل الدخول.');
        return;
      }
      navigate('/dashboard', { replace: true });
    } catch (err) {
      if (!isMountedRef.current) return;
      if (timerRef.current) window.clearTimeout(timerRef.current);
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'حدث خطأ أثناء تسجيل الدخول.');
    }
  };

  useEffect(() => {
    isMountedRef.current = true;

    const timeoutId = window.setTimeout(() => {
      if (isMountedRef.current) {
        if (retryCountRef.current < 2) {
          retryCountRef.current += 1;
          runCallback();
        } else {
          setStatus('error');
          setMessage('انتهت المهلة. يرجى المحاولة مرة أخرى.');
        }
      }
    }, 30000);

    runCallback();

    return () => {
      isMountedRef.current = false;
      if (timeoutId) window.clearTimeout(timeoutId);
      if (redirectRef.current) window.clearTimeout(redirectRef.current);
    };
  }, [navigate]);

  const handleRetry = () => {
    retryCountRef.current += 1;
    setStatus('loading');
    setMessage('جاري تسجيل الدخول...');
    runCallback();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#060a1f] flex-col gap-4">
      <div className={`text-lg ${status === 'error' ? 'text-red-400' : 'text-cyan-400'}`}>
        {message}
      </div>
      {status === 'error' && (
        <div className="flex flex-col items-center gap-3">
          <span className="text-slate-500 text-sm">يمكنك المحاولة مرة أخرى أو العودة للرئيسية</span>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 rounded-lg text-sm transition-colors"
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
