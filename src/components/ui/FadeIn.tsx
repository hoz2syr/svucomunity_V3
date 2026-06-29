import { type FC, type ReactNode } from 'react';
import { useInView } from '../../hooks/useInView';
import { useReducedMotion } from '../../hooks/useReducedMotion';

type FadeInDirection = 'up' | 'down' | 'left' | 'right' | 'scale';

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  blurLayer?: boolean;
  direction?: FadeInDirection;
  scale?: boolean;
}

export const FadeIn: FC<FadeInProps> = ({
  children,
  delay = 0,
  className = "",
  blurLayer = false,
  direction = 'up',
  scale = false,
}) => {
  const { ref, isInView } = useInView();
  const reducedMotion = useReducedMotion();

  const getTransform = () => {
    if (scale) {
      return isInView ? 'scale(1)' : 'scale(0.94)';
    }
    switch (direction) {
      case 'down':
        return isInView ? 'translateY(0)' : 'translateY(-24px)';
      case 'left':
        return isInView ? 'translateX(0)' : 'translateX(-24px)';
      case 'right':
        return isInView ? 'translateX(0)' : 'translateX(24px)';
      case 'up':
      default:
        return isInView ? 'translateY(0)' : 'translateY(24px)';
    }
  };

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
      className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isInView ? 'opacity-100 filter-none' : `opacity-0 ${blurLayer ? 'blur-md' : ''}`} ${className}`}
      style={{
        transform: getTransform(),
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};
