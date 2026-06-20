import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { Skeleton, TestCardSkeleton, PlayTestSkeleton } from '@/src/features/exam/src/components/Skeletons';

describe('Skeletons', () => {
  it('renders Skeleton with default variant', () => {
    render(<Skeleton data-testid="skel" />);
    expect(screen.getByTestId('skel')).toBeInTheDocument();
  });

  it('renders Skeleton with icon variant', () => {
    render(<Skeleton variant="icon" className="w-8 h-8" data-testid="skel-icon" />);
    expect(screen.getByTestId('skel-icon')).toBeInTheDocument();
  });

  it('renders TestCardSkeleton', () => {
    const { container } = render(<TestCardSkeleton />);
    expect(container.querySelector('.glass-card')).toBeTruthy();
  });

  it('renders PlayTestSkeleton', () => {
    const { container } = render(<PlayTestSkeleton />);
    expect(container.querySelector('.glass-card')).toBeTruthy();
  });

  it('applies custom className to Skeleton', () => {
    render(<Skeleton className="my-custom-class" data-testid="custom" />);
    const el = screen.getByTestId('custom');
    expect(el.className).toContain('my-custom-class');
  });
});
