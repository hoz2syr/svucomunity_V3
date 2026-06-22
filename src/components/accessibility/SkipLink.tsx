import { useEffect } from 'react';

export const SkipLink = () => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab' && !event.shiftKey) {
        document.body.classList.add('keyboard-nav');
      }
      if (event.key === 'Escape') {
        document.body.classList.remove('keyboard-nav');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:right-4 focus:z-[100] focus:bg-cyan-500 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:ring-2 focus:ring-cyan-300 focus:outline-none"
    >
      تخطي إلى المحتوى الرئيسي
    </a>
  );
};
