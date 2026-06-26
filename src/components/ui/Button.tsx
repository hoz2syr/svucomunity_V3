"use client";

import type { ReactNode } from 'react';

interface ButtonProps {
  children?: ReactNode;
  onClick?: () => void;
  onPress?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
  icon?: ReactNode;
  to?: string;
  variant?: 'primary' | 'secondary' | 'danger';
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
}: ButtonProps) {
  const handleClick = () => {
    if (disabled) return;
    if (onClick) onClick();
    if (onPress) onPress();
  };

  const variants = {
    primary: `
      bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-secondary-400)]
      hover:from-[var(--color-primary-400)] hover:to-[var(--color-secondary-300)]
    `,
    secondary: `
      bg-slate-700 hover:bg-slate-600
    `,
    danger: `
      bg-rose-600 hover:bg-rose-500
    `,
  };

  const baseClassName = `
    inline-flex items-center justify-center gap-2
    px-4 py-3 rounded-xl text-sm font-medium
    text-white shadow-[var(--shadow-glow-cyan)]
    hover:shadow-[var(--shadow-glow-cyan-strong)]
    transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
    ${variants[variant]}
    ${className}
  `;

  if (to) {
    return (
      <a href={to} className={baseClassName}>
        {icon}
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      className={baseClassName}
    >
      {icon}
      {children}
    </button>
  );
}