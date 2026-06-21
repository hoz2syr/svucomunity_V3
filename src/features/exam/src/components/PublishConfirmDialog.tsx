import React, { useEffect, useRef, useCallback, useId } from 'react';
import { motion } from 'motion/react';

interface PublishConfirmDialogProps {
  isOpen: boolean;
  testTitle: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const PublishConfirmDialog = ({ isOpen, testTitle, onConfirm, onCancel, isLoading = false }: PublishConfirmDialogProps) => {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const generatedTitleId = useId();
  const generatedDescId = useId();
  const titleId = `publish-confirm-title-${generatedTitleId}`;
  const descId = `publish-confirm-desc-${generatedDescId}`;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onCancel();
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
  }, [onCancel]);

  useEffect(() => {
    if (!isOpen) return;
    confirmButtonRef.current?.focus();
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#050815]/80 backdrop-blur-md"
        onClick={onCancel}
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
        className="relative z-10 w-full max-w-md bg-slate-900 border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden font-sans"
        dir="rtl"
      >
        <div className="p-6 pb-4">
          <h2 id={titleId} className="text-lg font-bold text-white mb-2">
            تأكيد نشر الاختبار
          </h2>
          <p id={descId} className="text-sm text-secondary-400 leading-relaxed">
            أنت على وشك نشر الاختبار
            <span className="text-white font-medium mx-1">"{testTitle}"</span>
            ليكون متاحاً للجميع عبر رابط عام. هل تريد المتابعة؟
          </p>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-secondary-800 text-secondary-200 border border-white/10 hover:bg-secondary-700 transition-colors disabled:opacity-50 cursor-pointer"
          >
            إلغاء
          </button>
          <button
            ref={confirmButtonRef}
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-primary-500 text-white hover:bg-primary-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-900/20"
          >
            {isLoading ? 'جاري النشر...' : 'نشر ومشاركة'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
