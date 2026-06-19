import { useRef, useState, useEffect } from 'react';

interface UseInViewOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

export const useInView = ({ threshold = 0.15, once = true, rootMargin = '0px' }: UseInViewOptions = {}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        if (once) observer.unobserve(el);
      }
    }, { threshold, rootMargin });

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return { ref, isInView };
};
