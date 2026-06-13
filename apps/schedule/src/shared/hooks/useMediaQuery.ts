import { useState, useEffect } from 'react';

const BREAKPOINTS = {
  mobile: 640,
  tablet: 1024,
} as const;

type Breakpoint = 'mobile' | 'tablet' | 'desktop';

export function useMediaQuery(): {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
} {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(() => {
    if (typeof window === 'undefined') return 'desktop';
    if (window.innerWidth < BREAKPOINTS.tablet) return 'tablet';
    if (window.innerWidth < BREAKPOINTS.mobile) return 'mobile';
    return 'desktop';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const width = window.innerWidth;
      if (width < BREAKPOINTS.mobile) {
        setBreakpoint('mobile');
      } else if (width < BREAKPOINTS.tablet) {
        setBreakpoint('tablet');
      } else {
        setBreakpoint('desktop');
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
  };
}
