import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Home as HomeIcon } from 'lucide-react';

export const Navbar = () => {
  const [sticky, setSticky] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setSticky(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const menu = menuRef.current;
    if (!menu) return;

    const focusableSelectors = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const getFocusable = () => Array.from(menu.querySelectorAll<HTMLElement>(focusableSelectors));

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = getFocusable();
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === first || !menu.contains(document.activeElement)) {
          event.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last || !menu.contains(document.activeElement)) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  const outerClass = `fixed w-full z-50 flex justify-center transition-all duration-500 ${sticky ? 'top-4' : 'top-0'}`;
  const navClass = `w-full relative transition-all duration-500 ${sticky ? 'max-w-80rem rounded-2xl bg-[var(--color-bg-glass)] backdrop-blur-xl border border-white/10 shadow-xl' : 'max-w-80rem bg-transparent border-transparent'}`;
  const innerClass = `px-4 sm:px-6 lg:px-8 transition-all duration-500 ${sticky ? 'h-16' : 'h-20'}`;

  return (
    <div className={outerClass}>
      <nav className={navClass}>
        <div className={innerClass}>
          <div className="flex justify-between items-center h-full">
            {/* Brand */}
            <div className="flex-shrink-0 flex items-center gap-3">
              <Link to="/" className="flex items-center gap-3 text-white font-bold text-sm sm:text-base shrink-0 group">
                <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[var(--color-cyan-400)] to-[var(--color-indigo-600)] flex items-center justify-center shadow-lg transition-all duration-300 group-hover:shadow-[var(--shadow-glow-indigo-70)] group-hover:scale-105">
                  <HomeIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <span className={`font-bold font-display tracking-wide transition-all duration-500 ${sticky ? 'text-lg md:text-xl' : 'text-xl md:text-2xl'} bg-gradient-to-r from-[var(--color-cyan-400)] to-[var(--color-indigo-600)] bg-clip-text text-transparent`} dir="ltr">
                  SVU Community
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex gap-1 items-center">
              {['المشاكل', 'الميزات', 'كيف نبدأ'].map((label, i) => {
                const href = ['#problems', '#features', '#how'][i];
                return (
              <a
                key={href}
                href={href}
                className="relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 outline-none text-[var(--color-text-muted)] hover:text-[var(--color-cyan-400)]"
              >
                {label}
              </a>
                );
              })}
            </div>

            {/* Desktop Login CTA */}
            <div className="hidden md:flex items-center">
              <Link
                to="/login"
                className="group relative outline-none"
              >
                <div
                  className="absolute inset-0 rounded-full opacity-40 group-hover:opacity-75 transition duration-300 bg-gradient-to-br from-[var(--color-cyan-400)] to-[var(--color-indigo-600)]"
                  style={{ filter: 'blur(8px)' }}
                />
                <div
                  className="relative font-bold px-6 py-2 rounded-full transition-all duration-300 text-sm flex items-center gap-2 bg-[var(--color-bg-primary)] border border-[var(--color-cyan-500)]/40 text-[var(--color-text-primary)] group-hover:bg-[var(--color-bg-secondary)]"
                >
                  سجّل الدخول
                  <span
                    className="transition-all duration-300 inline-block group-hover:rotate-90 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0"
                  >
                    ▾
                  </span>
                </div>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center p-2 relative z-50">
              <button
                ref={menuButtonRef}
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label={menuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
                aria-expanded={menuOpen}
                className="hover:text-[var(--color-cyan-400)] transition-colors text-[var(--color-text-muted)]"
              >
                {menuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          ref={menuRef}
          data-mobile-menu
          className={`md:hidden absolute top-full left-0 w-full overflow-hidden transition-all duration-300 ease-in-out ${menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
          style={{ marginTop: sticky ? '0.5rem' : '0' }}
        >
          <div className="p-4 flex flex-col gap-2 shadow-2xl bg-[var(--color-bg-glass)] backdrop-blur-2xl border border-white/10">
            {['المشاكل', 'الميزات', 'كيف نبدأ'].map((label, i) => {
              const href = ['#problems', '#features', '#how'][i];
              return (
                <a
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-3 rounded-xl font-medium transition-colors outline-none text-[var(--color-text-muted)] hover:text-[var(--color-cyan-400)] hover:bg-white/5"
                >
                  {label}
                </a>
              );
            })}
            <div className="h-px w-full my-2 bg-white/10" />
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="text-center px-5 py-3 rounded-xl font-bold transition-all bg-gradient-to-r from-[var(--color-cyan-400)] to-[var(--color-indigo-600)] text-[var(--color-bg-primary)]"
            >
              سجّل الدخول
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
};
