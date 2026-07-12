import { useEffect, useRef, useCallback, useId, useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Check, Copy, ExternalLink } from 'lucide-react';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';

interface PublishConfirmDialogProps {
  isOpen: boolean;
  testTitle: string;
  testId: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const PublishConfirmDialog = ({ isOpen, testTitle, testId, onConfirm, onCancel, isLoading = false }: PublishConfirmDialogProps) => {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const generatedTitleId = useId();
  const generatedDescId = useId();
  const titleId = `publish-confirm-title-${generatedTitleId}`;
  const descId = `publish-confirm-desc-${generatedDescId}`;
  const [showSuccess, setShowSuccess] = useState(false);
  const [step, setStep] = useState<'confirm' | 'success'>('confirm');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
    }
  }, [isOpen]);

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/exam/shared/${testId}`;
  }, [testId]);

  const { isCopied, copy } = useCopyToClipboard(shareUrl);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      if (step === 'confirm') onCancel();
      return;
    }
    if (event.key !== 'Tab') return;

    const focusableSelector = [
      'button:not([disabled])',
      '[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');

    const focusableElements = document.querySelectorAll<HTMLElement>(focusableSelector);
    if (focusableElements.length === 0) return;

    const elements = Array.from(focusableElements);
    const first = elements[0];
    const last = elements[elements.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }, [onCancel, step]);

  const handleKeyDownRef = useRef(handleKeyDown);
  useEffect(() => {
    handleKeyDownRef.current = handleKeyDown;
  }, [handleKeyDown]);

  useEffect(() => {
    if (!isOpen) {
      setShowSuccess(false);
      setStep('confirm');
      return;
    }
    confirmButtonRef.current?.focus();
    const handler = (event: KeyboardEvent) => handleKeyDownRef.current(event);
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen]);

  const handleConfirm = async () => {
    setError(null);
    try {
      await onConfirm();
      setStep('success');
      setShowSuccess(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'حدث خطأ أثناء النشر.';
      setError(message);
    }
  };

  const handleCopy = () => copy();

  const handleDone = () => {
    setShowSuccess(false);
    setStep('confirm');
    onCancel();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[var(--color-bg-overlay)] backdrop-blur-md"
        onClick={step === 'confirm' ? onCancel : undefined}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        tabIndex={-1}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative z-10 w-full max-w-md bg-[var(--color-bg-primary)] border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden font-sans"
        dir="rtl"
      >
        {step === 'confirm' && !showSuccess && (
          <>
            <div className="p-6 pb-4">
              <h2 id={titleId} className="text-lg font-bold text-white mb-2">
                تأكيد نشر الاختبار
              </h2>
              <p id={descId} className="text-sm text-secondary-400 leading-relaxed">
                أنت على وشك نشر الاختبار
                <span className="text-white font-medium mx-1">&ldquo;{testTitle}&rdquo;</span>
                ليكون متاحاً للجميع عبر رابط عام. هل تريد المتابعة؟
              </p>
              {error && (
                <div className="mt-3 p-3 rounded-xl bg-[var(--color-danger-light)] border border-[var(--color-danger-border)] text-[var(--color-danger-400)] text-sm">
                  {error}
                </div>
              )}
            </div>

            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] border border-white/10 hover:bg-[var(--color-bg-elevated)]/80 transition-colors disabled:opacity-50 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                ref={confirmButtonRef}
                onClick={handleConfirm}
                disabled={isLoading}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-[var(--color-info)] text-white hover:bg-[var(--color-info-400)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[var(--color-info)]/20"
              >
                {isLoading ? 'جاري النشر...' : 'نشر ومشاركة'}
              </button>
            </div>
          </>
        )}

        {step === 'success' && showSuccess && (
          <>
            <div className="p-6 pb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-[var(--color-success-light)] flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-[var(--color-success-400)]" />
                </div>
                <h2 id={titleId} className="text-lg font-bold text-white">
                  تم النشر بنجاح!
                </h2>
              </div>
              <p id={descId} className="text-sm text-secondary-400 leading-relaxed">
                يمكن لأي شخص الآن الوصول إلى الاختبار عبر الرابط أدناه:
              </p>
            </div>

            <div className="px-6 pb-4">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--color-bg-elevated)]/60 border border-white/10">
                <ExternalLink className="w-4 h-4 text-secondary-400 flex-shrink-0" />
                <p className="text-xs text-secondary-300 truncate flex-1 select-all" dir="ltr">
                  {shareUrl}
                </p>
              </div>
              <button
                onClick={handleCopy}
                className="mt-3 w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 bg-[var(--color-info-light)] text-[var(--color-info-400)] border border-[var(--color-info-border)] hover:bg-[var(--color-info-light)] transition-colors cursor-pointer"
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4" />
                    تم نسخ الرابط!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    نسخ رابط المشاركة
                  </>
                )}
              </button>
            </div>

            <div className="px-6 pb-6">
              <button
                onClick={handleDone}
                className="w-full py-2.5 rounded-xl text-sm font-medium bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] border border-white/10 hover:bg-[var(--color-bg-elevated)]/80 transition-colors cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};
