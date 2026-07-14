import { type ReactNode } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface ButtonProps {
  children?: ReactNode;
  onClick?: () => void;
  onPress?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
  icon?: ReactNode;
  to?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'auth' | 'ghost';
  isLoading?: boolean;
  loadingText?: string;
}

export function Button({
  children,
  onClick,
  onPress,
  disabled = false,
  className = '',
  type = 'button',
  icon,
  to,
  variant = 'primary',
  isLoading = false,
  loadingText,
}: ButtonProps) {
  const handleClick = () => {
    if (disabled || isLoading) return;
    if (onClick) onClick();
    if (onPress) onPress();
  };

  const variants = {
    primary: [
      'bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-500)]',
      'text-white',
      'shadow-[var(--shadow-button)]',
    ],
    secondary: [
      'bg-white/6 hover:bg-white/10',
      'border border-white/10',
      'text-[var(--color-text-primary)]',
    ],
    danger: [
      'bg-[var(--color-danger)] hover:bg-[var(--color-danger-400)]',
      'text-white',
      'shadow-none',
    ],
    auth: [
      'w-full bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-500)]',
      'text-white font-bold rounded-xl',
      'shadow-none',
      'transition-all flex items-center justify-center gap-2',
      'group relative overflow-hidden',
      'disabled:opacity-80 disabled:cursor-not-allowed',
    ],
    ghost: [
      'bg-transparent',
      'border border-white/10',
      'text-[var(--color-text-secondary)]',
      'hover:bg-white/5 hover:text-white hover:border-white/20',
    ],
  };

  const baseClasses = [
    'inline-flex items-center justify-center gap-2',
    'px-[var(--space-button-x)] py-[var(--space-button-y)]',
    'rounded-[var(--radius-button)] text-sm font-medium',
    'transition-all duration-200',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ];

  const mergedClassName = cn(
    ...baseClasses,
    ...variants[variant],
    className
  );

  if (to) {
    return (
      <a href={to} className={mergedClassName}>
        {icon}
        {children}
      </a>
    );
  }

  if (variant === 'auth') {
    return (
      <motion.button
        type={type}
        className={mergedClassName}
        disabled={disabled || isLoading}
        onClick={handleClick}
        whileTap={{ scale: 0.98 }}
      >
        {isLoading && (
          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        <span className="relative z-10 transition-transform group-hover:scale-105 flex items-center gap-2">
          {isLoading ? (loadingText || children) : children}
        </span>
      </motion.button>
    );
  }

  return (
    <button
      type={type}
      className={mergedClassName}
      disabled={disabled || isLoading}
      onClick={handleClick}
    >
      {icon}
      {children}
    </button>
  );
}
