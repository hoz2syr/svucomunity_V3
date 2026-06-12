import { forwardRef } from 'react';

export const Button = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ children, className = '', variant = 'primary', ...props }, ref) => {

    const base = 'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

    const variants = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      outline: 'border border-secondary-600 bg-transparent hover:bg-secondary/50',
      ghost: 'hover:bg-secondary/50',
    } as const;

    return (
      <button ref={ref} className={`${base} ${variants[variant as keyof typeof variants] || variants.primary} ${className}`} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
