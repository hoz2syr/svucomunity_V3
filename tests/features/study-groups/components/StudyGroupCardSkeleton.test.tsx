import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StudyGroupCardSkeleton } from '@/src/features/study-groups/components/StudyGroupCardSkeleton';

describe('StudyGroupCardSkeleton component', () => {
  it('should render one skeleton by default', () => {
    render(<StudyGroupCardSkeleton />);
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBe(1);
  });

  it('should render specified number of skeletons', () => {
    render(<StudyGroupCardSkeleton count={4} />);
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBe(4);
  });

  it('should render zero skeletons when count is 0', () => {
    render(<StudyGroupCardSkeleton count={0} />);
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBe(0);
  });

  it('should render skeleton card with correct structure', () => {
    render(<StudyGroupCardSkeleton count={1} />);
    const card = document.querySelector('.bg-white\\/\\[0\\.03\\]');
    expect(card).toBeTruthy();
  });
});
