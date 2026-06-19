import  { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const NAV_CLASSES = {
  outer: 'fixed w-full z-50 flex justify-center transition-all duration-500',
  nav: 'w-full relative transition-all duration-500',
  inner: 'px-4 sm:px-6 lg:px-8 transition-all duration-500',
  brandContainer: 'flex-shrink-0 flex items-center gap-3',
  logo: 'w-8 h-8 rounded-lg flex items-center justify-center shadow-lg transition-all duration-500',
  brandName: 'font-bold font-display tracking-wide transition-all duration-500',
  desktopLinks: 'hidden md:flex gap-1 items-center',
  desktopActions: 'hidden md:flex items-center',
  mobileMenuButton: 'md:hidden flex items-center p-2 relative z-50 focus:outline-none',
  mobileMenu: 'md:hidden absolute top-full left-0 w-full overflow-hidden transition-all duration-300 ease-in-out',
  mobileMenuInner: 'p-4 flex flex-col gap-2 shadow-2xl',
  mobileDivider: 'h-px w-full my-2',
};

const NAV_STYLES = {
  stickyOuter: { top: '1rem' },
  baseOuter: { top: '0' },
  stickyNav: {
    maxWidth: '80rem',
    borderRadius: '1rem',
    backgroundColor: 'rgba(4, 4, 7, 0.72)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(79, 79, 128, 0.24)',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
  },
  baseNav: {
    maxWidth: '80rem',
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  baseBrand: {
    background: 'linear-gradient(135deg, #6199f6 0%, #4f4f80 100%)',
  },
  baseLogo: {
    color: '#040407',
  },
  baseBrandText: {
    background: 'linear-gradient(135deg, #6199f6 0%, #91BAF8 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  stickyBrand: {
    background: 'linear-gradient(135deg, #6199f6 0%, #4f4f80 100%)',
  },
  stickyLogoText: {
    color: '#040407',
  },
  stickyBrandText: {
    background: 'linear-gradient(135deg, #6199f6 0%, #91BAF8 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  baseDesktopLink: {
    color: '#a3a3b3',
  },
  hoverDesktopLink: {
    color: '#fcfcfc',
  },
  activeDesktopLink: {
    color: '#6199f6',
  },
  baseLoginOuter: {
    background: '#040407',
  },
  hoverLoginOuter: {
    background: '#0a0a13',
  },
  loginBorder: {
    borderColor: 'rgba(79, 79, 128, 0.4)',
  },
  loginText: {
    color: '#fcfcfc',
  },
  mobileMenuBg: {
    background: 'rgba(10, 10, 19, 0.92)',
    border: '1px solid rgba(79, 79, 128, 0.24)',
  },
  mobileMenuLink: {
    color: '#a3a3b3',
  },
  hoverMobileMenuLink: {
    color: '#6199f6',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  mobileLogin: {
    background: 'linear-gradient(135deg, #6199f6 0%, #4f4f80 100%)',
    color: '#040407',
  },
};

export const Navbar = () => {
  const [sticky, setSticky] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [hoveredLoginDesktop, setHoveredLoginDesktop] = useState(false);
  const [hoveredMobileLink, setHoveredMobileLink] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setSticky(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const outerStyle = sticky ? NAV_STYLES.stickyOuter : NAV_STYLES.baseOuter;

  return (
    <div
      className={NAV_CLASSES.outer}
      style={outerStyle}
    >
      <nav
        className={NAV_CLASSES.nav}
        style={sticky ? NAV_STYLES.stickyNav : NAV_STYLES.baseNav}
      >
        <div
          className={`${NAV_CLASSES.inner} ${sticky ? 'h-16' : 'h-24'}`}
        >
          <div className="flex justify-between items-center h-full">
            {/* Brand */}
            <div className={NAV_CLASSES.brandContainer}>
              <div
                className={NAV_CLASSES.logo}
                style={sticky ? NAV_STYLES.stickyBrand : NAV_STYLES.baseBrand}
              >
                <span
                  className="font-bold text-sm"
                  style={sticky ? NAV_STYLES.stickyLogoText : NAV_STYLES.baseLogo}
                >
                  S
                </span>
              </div>
              <span
                className={`${NAV_CLASSES.brandName} ${
                  sticky ? 'text-lg md:text-xl' : 'text-xl md:text-2xl'
                }`}
                dir="ltr"
                style={sticky ? NAV_STYLES.stickyBrandText : NAV_STYLES.baseBrandText}
              >
                SVU Community
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className={NAV_CLASSES.desktopLinks}>
              {['المشاكل', 'الميزات', 'كيف نبدأ'].map((label, i) => {
                const href = ['#problems', '#features', '#how'][i];
                const isHovered = hoveredLink === href;
                const isActive = false;

                return (
                  <a
                    key={href}
                    href={href}
                    className="relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 outline-none"
                    style={
                      isActive
                        ? NAV_STYLES.activeDesktopLink
                        : isHovered
                        ? NAV_STYLES.hoverDesktopLink
                        : NAV_STYLES.baseDesktopLink
                    }
                    onMouseEnter={() => setHoveredLink(href)}
                    onMouseLeave={() => setHoveredLink(null)}
                  >
                    {label}
                  </a>
                );
              })}
            </div>

            {/* Desktop Login CTA */}
            <div className={NAV_CLASSES.desktopActions}>
              <Link
                to="/login"
                className="group relative outline-none"
                onMouseEnter={() => setHoveredLoginDesktop(true)}
                onMouseLeave={() => setHoveredLoginDesktop(false)}
              >
                <div
                  className="absolute inset-0 rounded-full opacity-40 group-hover:opacity-75 transition duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #6199f6 0%, #4f4f80 100%)',
                    filter: 'blur(8px)',
                  }}
                />
                <div
                  className="relative font-bold px-6 py-2 rounded-full transition-all duration-300 text-sm flex items-center gap-2"
                  style={{
                    ...(hoveredLoginDesktop ? NAV_STYLES.hoverLoginOuter : NAV_STYLES.baseLoginOuter),
                    ...NAV_STYLES.loginBorder,
                    color: '#fcfcfc',
                  }}
                >
                  سجّل الدخول
                  <span
                    className="transition-all duration-300"
                    style={{
                      display: 'inline-block',
                      transform: hoveredLoginDesktop ? 'rotate(90deg) translateX(0)' : 'rotate(0deg) translateX(-6px)',
                      opacity: hoveredLoginDesktop ? 1 : 0,
                      marginLeft: hoveredLoginDesktop ? '0' : '-6px',
                    }}
                  >
                    ▾
                  </span>
                </div>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className={NAV_CLASSES.mobileMenuButton}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label={menuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
                aria-expanded={menuOpen}
                style={{ color: '#a3a3b3' }}
                className="hover:text-[#6199f6] transition-colors"
              >
                {menuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={NAV_CLASSES.mobileMenu}
          style={{
            maxHeight: menuOpen ? '16rem' : '0',
            opacity: menuOpen ? 1 : 0,
            marginTop: sticky ? '0.5rem' : '0',
          }}
        >
          <div
            className={NAV_CLASSES.mobileMenuInner}
            style={NAV_STYLES.mobileMenuBg}
          >
            {['المشاكل', 'الميزات', 'كيف نبدأ'].map((label, i) => {
              const href = ['#problems', '#features', '#how'][i];
              const isHovered = hoveredMobileLink === href;
              const linkStyle = isHovered ? NAV_STYLES.hoverMobileMenuLink : NAV_STYLES.mobileMenuLink;

              return (
                <a
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-3 rounded-xl font-medium transition-colors outline-none"
                  style={linkStyle}
                  onMouseEnter={() => setHoveredMobileLink(href)}
                  onMouseLeave={() => setHoveredMobileLink(null)}
                >
                  {label}
                </a>
              );
            })}
            <div className={NAV_CLASSES.mobileDivider} style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }} />
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="text-center px-5 py-3 rounded-xl font-bold transition-all"
              style={NAV_STYLES.mobileLogin}
            >
              سجّل الدخول
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
};
