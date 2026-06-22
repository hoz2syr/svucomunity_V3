import { type FC, type ReactNode } from 'react';
import { useInView } from '../../hooks/useInView';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  blurLayer?: boolean;
}

export const FadeIn: FC<FadeInProps> = ({ children, delay = 0, className = "", blurLayer = false }) => {
  const { ref, isInView } = useInView();
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

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
