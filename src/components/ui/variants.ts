import { cva } from '@/src/lib/cva';

export const glassCardVariants = cva(
  [
    'relative overflow-hidden',
    'rounded-[var(--radius-card)]',
    'border border-[var(--color-border)]',
    'transition-all duration-200',
  ],
  {
    variants: {
      hover: {
        true: [
          'hover:-translate-y-1',
          'hover:shadow-[var(--shadow-card)]',
          'hover:border-[var(--color-border-hover)]',
        ],
      },
      glow: {
        cosmic: ['shadow-[var(--shadow-elevated)]'],
        ocean: ['shadow-[var(--shadow-card)]'],
        tide: ['shadow-[var(--shadow-button)]'],
        aura: ['shadow-[var(--shadow-card)]'],
      },
    },
    defaultVariants: {
      hover: false,
    },
  }
);

export const inputVariants = cva(
  [
    'w-full rounded-[var(--radius-input)]',
    'bg-[var(--color-bg-input)]',
    'border border-[var(--color-border-default)]',
    'px-[var(--space-input)] py-2',
    'text-[var(--color-text-primary)]',
    'placeholder:text-[var(--color-text-muted)]',
    'transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-[var(--ring-color-strong)]',
  ],
  {
    variants: {
      state: {
        default: ['hover:border-[var(--color-border-hover)]'],
        error: [
          'border-[var(--color-danger-500)]',
          'focus:ring-[var(--color-danger-500)]',
        ],
      },
    },
    defaultVariants: {
      state: 'default',
    },
  }
);
