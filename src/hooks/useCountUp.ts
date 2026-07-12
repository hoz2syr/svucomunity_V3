import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { useReducedMotion } from './useReducedMotion';

interface UseCountUpOptions {
  end: number;
  duration?: number;
  delay?: number;
  startOnView?: boolean;
}

export const useCountUp = ({ end, duration = 2000, delay = 0, startOnView = true }: UseCountUpOptions) => {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(!startOnView);
  const reducedMotion = useReducedMotion();
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (reducedMotion) {
      setCount(end);
    }
  }, [reducedMotion, end]);

  useLayoutEffect(() => {
    if (startOnView) {
      setHasStarted(false);
    }
  }, [startOnView]);

  const start = () => {
    if (hasStarted || reducedMotion) return;
    setHasStarted(true);
  };

  useEffect(() => {
    if (!hasStarted || reducedMotion) return;

    const timer = setTimeout(() => {
      startTimeRef.current = performance.now();

      const animate = (now: number) => {
        if (!startTimeRef.current) startTimeRef.current = now;
        const elapsed = now - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        setCount(Math.round(eased * end));

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(animate);
        }
      };

      rafRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timer);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      startTimeRef.current = null;
    };
  }, [hasStarted, end, duration, delay, reducedMotion]);

  return { count, start };
};