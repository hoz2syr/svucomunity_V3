import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { resetPasswordSchema } from '../../schemas/auth.schema';
import { getErrorMessage } from '../../services/environment.service';
import { hasSupabaseEnv, missingSupabaseEnvMessage } from '../../services/environment.service';
import { resetPassword } from '../../services/auth.service';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ForgotPasswordModal = ({ isOpen, onClose }: ForgotPasswordModalProps) => {
  const [resetEmail, setResetEmail] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const resetTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        window.clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setResetEmail('');
      setResetError('');
      setResetSuccess(false);
      setResetLoading(false);
    }
  }, [isOpen]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess(false);

    if (!resetPasswordSchema.safeParse({ email: resetEmail }).success) {
      setResetError('يرجى إدخال بريد إلكتروني صحيح');
      return;
    }

    if (!hasSupabaseEnv()) {
      setResetError(missingSupabaseEnvMessage);
      return;
    }

    setResetLoading(true);
    try {
      const { error } = await resetPassword(resetEmail);

      if (error) {
        setResetError(error.message || 'فشل إرسال رابط الاستعادة. حاول مرة أخرى.');
        return;
      }

      setResetSuccess(true);
      setResetEmail('');
      if (resetTimerRef.current) window.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = window.setTimeout(() => {
        onClose();
        setResetSuccess(false);
      }, 4000);
    } catch (error) {
      setResetError(getErrorMessage(error));
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[var(--color-bg-primary)]/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-[var(--color-bg-primary)] border border-white/10 rounded-[2rem] p-8 max-w-md w-full relative z-10 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">استعادة كلمة المرور</h3>
              <button
                onClick={onClose}
                aria-label="إغلاق"
                className="text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full p-1.5 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.
            </p>

            <form onSubmit={handleReset} className="space-y-5">
              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-2 uppercase tracking-wider" htmlFor="resetEmail">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  id="resetEmail"
                  required
                  value={resetEmail}
                  onChange={(e) => {
                    setResetEmail(e.target.value);
                    if (resetError) setResetError('');
                  }}
                   className="w-full bg-[var(--color-bg-overlay)]/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-sans"
                  placeholder="email@example.com"
                />
              </div>

               {resetError && <p className="text-[var(--color-danger-400)] text-xs">{resetError}</p>}

              {resetSuccess && (
                <p className="text-emerald-400 text-xs flex items-center gap-2">
                  ✓ تم إرسال رابط الاستعادة إلى بريدك الإلكتروني
                </p>
              )}

              <button
                type="submit"
                disabled={resetLoading}
                 className="w-full bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-secondary-400)] text-white font-bold py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {resetLoading ? 'جاري الإرسال...' : 'إرسال رابط الاستعادة'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
