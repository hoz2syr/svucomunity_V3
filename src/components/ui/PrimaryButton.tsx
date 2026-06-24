"use client";

interface PrimaryButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
  onPress?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
  icon?: React.ReactNode;
  to?: string;
}

export function PrimaryButton({
  children,
  onClick,
  onPress,
  disabled = false,
  className = '',
  type = 'button',
  icon,
  to,
}: PrimaryButtonProps) {
  const handleClick = () => {
    if (disabled) return;
    if (onClick) onClick();
    if (onPress) onPress();
  };

  const baseClassName = `
    inline-flex items-center justify-center gap-2
    px-4 py-2.5 rounded-xl text-sm font-medium
    bg-cyan-600 hover:bg-cyan-500 text-white
    shadow-[0_0_20px_rgba(6,182,212,0.25)]
    hover:shadow-[0_0_28px_rgba(6,182,212,0.4)]
    transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
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
