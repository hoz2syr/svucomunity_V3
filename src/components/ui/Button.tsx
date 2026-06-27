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
  variant?: 'primary' | 'secondary' | 'danger' | 'auth';
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
      'bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-secondary-400)]',
      'hover:from-[var(--color-primary-400)] hover:to-[var(--color-secondary-300)]',
      'shadow-[var(--shadow-glow-cyan)]',
      'hover:shadow-[var(--shadow-glow-cyan-strong)]',
      'text-white',
    ],
    secondary: [
      'bg-slate-700 hover:bg-slate-600',
      'text-white',
    ],
    danger: [
      'bg-[var(--color-danger)] hover:bg-[var(--color-danger-400)]',
      'text-white',
    ],
    auth: [
      'w-full bg-gradient-to-r from-[var(--color-primary-400)] to-[var(--color-secondary-400)]',
      'text-white font-bold rounded-xl',
      'shadow-[var(--shadow-glow-cyan)]',
      'hover:shadow-[var(--shadow-glow-cyan-50)]',
      'transition-all flex items-center justify-center gap-2',
      'group relative overflow-hidden',
      'disabled:opacity-80 disabled:cursor-not-allowed',
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
