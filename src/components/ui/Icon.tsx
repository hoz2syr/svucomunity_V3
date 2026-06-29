import { type ComponentType, type SVGProps, forwardRef } from 'react';
import { cn } from '@/src/lib/utils';

const sizeClasses = {
  xs: 'w-3.5 h-3.5',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
} as const;

type IconSize = keyof typeof sizeClasses;

interface IconProps extends SVGProps<SVGSVGElement> {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  size?: IconSize;
  strokeWidth?: number;
  className?: string;
}

const normalizedSizes: Record<string, IconSize> = {
  xs: 'xs',
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'xl',
};

export const Icon = forwardRef<SVGSVGElement, IconProps>(
  ({ icon: LucideIcon, size = 'sm', strokeWidth, className, ...rest }, ref) => {
    const safeSize = normalizedSizes[size] ?? 'sm';
    const hasCustomStroke = strokeWidth !== undefined && strokeWidth !== 2;
    const lucideClassName = cn(sizeClasses[safeSize], className);

    return (
      <LucideIcon
        ref={ref}
        width={undefined}
        height={undefined}
        {...(hasCustomStroke ? { strokeWidth } : {})}
        className={lucideClassName}
        {...rest}
      />
    );
  }
);

Icon.displayName = 'Icon';
