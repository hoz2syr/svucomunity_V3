import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export const Navbar = () => {
  const [sticky, setSticky] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

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

  return (
    <motion.div
      className="fixed w-full z-50 flex justify-center"
      animate={reducedMotion ? { top: sticky ? 16 : 0 } : { top: sticky ? 16 : 0 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.nav
        className="w-full"
        animate={{
          maxWidth: '80rem',
          borderRadius: sticky ? 16 : 0,
          backgroundColor: sticky ? 'rgba(15, 23, 42, 0.85)' : 'transparent',
          border: sticky ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
          boxShadow: sticky ? 'var(--shadow-card)' : 'none',
          backdropFilter: sticky ? 'blur(20px)' : 'blur(0px)',
        }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          className="px-4 sm:px-6 lg:px-8 flex justify-between items-center"
          animate={{ height: sticky ? 64 : 80 }}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Brand */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <motion.div
              className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden shadow-md bg-slate-800"
              whileHover={reducedMotion ? {} : { scale: 1.05 }}
              whileTap={reducedMotion ? {} : { scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <img src="/favicon.svg" alt="" className="w-full h-full object-contain" />
            </motion.div>
            <span className="font-bold font-display tracking-wide bg-gradient-to-r from-[var(--color-primary-400)] to-[var(--color-primary-600)] bg-clip-text text-transparent" dir="ltr">
              <span className={`hidden sm:inline transition-all duration-200 ${sticky ? 'text-lg md:text-xl' : 'text-xl md:text-2xl'}`}>
                SVU Community
              </span>
              <span className="sm:hidden text-lg">SVU</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-1 items-center">
            {['المشاكل', 'الميزات', 'كيف نبدأ'].map((label, i) => {
              const href = ['#problems', '#features', '#how'][i];
              return (
                <a
                  key={href}
                  href={href}
                  className="relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-150 outline-none text-[var(--color-text-muted)] hover:text-[var(--color-primary-400)] group"
                >
                  {label}
                  <span className="absolute inset-x-2 -bottom-0.5 h-0.5 bg-[var(--color-primary-500)] rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
                </a>
              );
            })}
          </div>

          {/* Desktop Login CTA */}
          <div className="hidden md:flex items-center">
            <Link to="/login" className="group relative outline-none">
              <div
                className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-30 transition duration-300 bg-[var(--color-primary-600)]"
                style={{ filter: 'blur(12px)' }}
              />
              <motion.div
                className="relative font-bold px-6 py-2 rounded-full text-sm flex items-center gap-2 bg-[var(--color-bg-primary)] border border-[var(--color-primary-500)]/30 text-[var(--color-text-primary)]"
                whileHover={reducedMotion ? {} : { scale: 1.02, borderColor: 'rgba(99,102,241,0.6)' }}
                whileTap={reducedMotion ? {} : { scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                سجّل الدخول
                <motion.span
                  className="inline-block"
                  animate={{ rotate: menuOpen ? 90 : 0, opacity: menuOpen ? 1 : 0, x: menuOpen ? 0 : -4 }}
                  transition={{ duration: 0.2 }}
                >
                  ▾
                </motion.span>
              </motion.div>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center p-2 relative z-50">
            <motion.button
              ref={menuButtonRef}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
              aria-expanded={menuOpen}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-primary-400)] transition-colors"
              whileTap={reducedMotion ? {} : { scale: 0.9 }}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </motion.div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              ref={menuRef}
              data-mobile-menu
              initial={{ maxHeight: 0, opacity: 0 }}
              animate={{ maxHeight: 500, opacity: 1 }}
              exit={{ maxHeight: 0, opacity: 0 }}
              transition={reducedMotion ? { duration: 0 } : { duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="md:hidden overflow-hidden"
              style={{ marginTop: sticky ? '0.5rem' : '0' }}
            >
              <div className="p-4 flex flex-col gap-2 shadow-xl bg-[var(--color-bg-secondary)]/95 backdrop-blur-xl border border-white/8">
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
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </motion.div>
  );
};
