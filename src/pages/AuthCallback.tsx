import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { completeAuthCallback } from '../services/auth.service';

export const AuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [message, setMessage] = useState('جاري تسجيل الدخول...');
  const timerRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    let timeoutId: number | null = null;
    let redirectId: number | null = null;

    const timer = window.setTimeout(() => {
      if (isMountedRef.current) {
        setStatus('error');
        setMessage('انتهت مهلة العملية. جارٍ تحويلك لتسجيل الدخول...');
        redirectId = window.setTimeout(() => {
          if (isMountedRef.current) navigate('/login', { replace: true });
        }, 2500);
      }
    }, 10000);
    timeoutId = timer;

    completeAuthCallback()
      .then((result) => {
        if (isMountedRef.current) {
          if (timeoutId) window.clearTimeout(timeoutId);
          if (redirectId) window.clearTimeout(redirectId);
          if (result.error) {
            setStatus('error');
            setMessage(result.error.message || 'حدث خطأ أثناء تسجيل الدخول. جارٍ تحويلك لتسجيل الدخول...');
            redirectId = window.setTimeout(() => {
              if (isMountedRef.current) navigate('/login', { replace: true });
            }, 3000);
            return;
          }
          navigate('/dashboard', { replace: true });
        }
      })
      .catch((err) => {
        if (isMountedRef.current) {
          if (timeoutId) window.clearTimeout(timeoutId);
          setStatus('error');
          setMessage(err?.message || 'حدث خطأ أثناء تسجيل الدخول. جارٍ تحويلك لتسجيل الدخول...');
          redirectId = window.setTimeout(() => {
            if (isMountedRef.current) navigate('/login', { replace: true });
          }, 3000);
        }
      });

    return () => {
      isMountedRef.current = false;
      if (timeoutId) window.clearTimeout(timeoutId);
      if (redirectId) window.clearTimeout(redirectId);
    };
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#060a1f] flex-col gap-4">
      <div className={`text-lg ${status === 'error' ? 'text-red-400' : 'text-cyan-400'}`}>
        {message}
      </div>
      {status === 'error' && (
        <div className="text-slate-500 text-sm">يمكنك المحاولة مرة أخرى أو العودة للرئيسية</div>
      )}
    </div>
  );
};
