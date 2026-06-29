import { type ReactNode } from 'react';

type AnimatedBackgroundProps = {
  className?: string;
  intensity?: 'subtle' | 'medium' | 'strong';
  children: ReactNode;
};

const intensityClasses = {
  subtle: 'opacity-20',
  medium: 'opacity-35',
  strong: 'opacity-50',
};

export const AnimatedBackground = ({
  className = '',
  intensity = 'medium',
  children,
}: AnimatedBackgroundProps) => (
  <div className={`animated-bg ${className}`}>
    <div className={`mesh-gradient ${intensityClasses[intensity]}`} aria-hidden="true">
      <div className="mesh-gradient-blob mesh-gradient-blob-cyan" />
      <div className="mesh-gradient-blob mesh-gradient-blob-indigo" />
      <div className="mesh-gradient-blob mesh-gradient-blob-teal" />
    </div>
    <div className="relative z-10">{children}</div>
  </div>
);
