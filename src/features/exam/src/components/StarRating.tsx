"use client";

import { Star } from 'lucide-react';
import { cn } from '../lib/utils';

interface StarRatingProps {
  rating: number;
  onRate: (stars: number) => void;
  readonly?: boolean;
  size?: number;
}

export function StarRating({ rating, onRate, readonly = false, size = 20 }: StarRatingProps) {
  const displayRating = Math.round(rating);

  return (
    <div className="flex items-center gap-0.5" dir="rtl">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onRate(star)}
          className={cn(
            'p-0.5 rounded-md transition-all',
            !readonly && 'hover:scale-125 cursor-pointer',
            readonly && 'cursor-default'
          )}
          aria-label={`${star} من 5`}
          tabIndex={readonly ? -1 : 0}
        >
          <Star
            className="transition-colors"
            style={{ width: size, height: size }}
            fill={star <= displayRating ? 'currentColor' : 'none'}
            color={star <= displayRating ? 'var(--color-warning-400)' : 'var(--color-text-muted)'}
            strokeWidth={star <= displayRating ? 0 : 2}
          />
        </button>
      ))}
    </div>
  );
}
