import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SkeletonGrid } from '../components/course-grid/SkeletonGrid';

describe('SkeletonGrid', () => {
  it('renders default 6 skeleton items', () => {
    render(<SkeletonGrid />);
    const items = screen.getAllByTestId('skeleton-item');
    expect(items.length).toBe(6);
  });

  it('renders custom count skeleton items', () => {
    render(<SkeletonGrid count={3} />);
    const items = screen.getAllByTestId('skeleton-item');
    expect(items.length).toBe(3);
  });
});
