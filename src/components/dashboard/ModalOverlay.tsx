import React, { useEffect, useRef, useCallback, useId } from 'react';
import { motion } from 'motion/react';

export const ModalOverlay = ({ children, onClose, titleId, descriptionId, ariaLabel }: { children: React.ReactNode; onClose: () => void; titleId?: string; descriptionId?: string; ariaLabel?: string }) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const generatedTitleId = useId();
  const generatedDescId = useId();
  const resolvedTitleId = titleId ?? `modal-title-${generatedTitleId}`;
  const resolvedDescId = descriptionId ?? `modal-desc-${generatedDescId}`;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
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

    const focusableElements = dialogRef.current?.querySelectorAll<HTMLElement>(focusableSelector);
    if (!focusableElements || focusableElements.length === 0) return;

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
  }, [onClose]);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const focusableSelector = [
      'button:not([disabled])',
      '[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');

    const focusableElements = dialogRef.current?.querySelectorAll<HTMLElement>(focusableSelector);
    focusableElements?.[0]?.focus();

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [handleKeyDown]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[var(--color-bg-overlay)] backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={resolvedTitleId}
        aria-describedby={resolvedDescId}
        aria-label={ariaLabel}
        tabIndex={-1}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative z-10 w-full max-w-md bg-[var(--color-bg-primary)] border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden font-sans"
        dir="rtl"
      >
        {children}
      </motion.div>
    </div>
  );
};
