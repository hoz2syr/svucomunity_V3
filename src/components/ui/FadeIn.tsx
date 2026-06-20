import React, { FC, ReactNode } from 'react';
import { useInView } from '../../hooks/useInView';

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  blurLayer?: boolean;
}

/**
 * Animated wrapper component that fades and translates its children in when they enter the viewport.
 * Uses useInView hook to detect intersection.
 */
export const FadeIn: FC<FadeInProps> = ({ children, delay = 0, className = "", blurLayer = false }) => {
  const { ref, isInView } = useInView();
  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${isInView ? 'opacity-100 translate-y-0 filter-none' : `opacity-0 translate-y-12 ${blurLayer ? 'blur-md' : ''}`} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};
