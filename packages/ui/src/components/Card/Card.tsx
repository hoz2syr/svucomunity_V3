import { forwardRef, HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: ReactNode
  description?: ReactNode
  footer?: ReactNode
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, className = '', title, description, footer, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`rounded-2xl border border-secondary-700 bg-secondary-900/50 p-6 text-white ${className}`}
        {...props}
      >
        {(title || description) && (
          <div className="mb-4">
            {title ? <h3 className="text-lg font-semibold text-white">{title}</h3> : null}
            {description ? <p className="text-sm text-secondary-400 mt-1">{description}</p> : null}
          </div>
        )}
        {children}
        {footer ? <div className="mt-4 pt-4 border-t border-secondary-700">{footer}</div> : null}
      </div>
    );
  }
);

Card.displayName = 'Card';
