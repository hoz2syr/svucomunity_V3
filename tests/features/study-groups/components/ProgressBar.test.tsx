import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressBar } from '@/src/features/study-groups/components/ProgressBar';

describe('ProgressBar component', () => {
  it('should render current and max values', () => {
    render(<ProgressBar current={3} max={10} />);
    expect(screen.getByText('3 / 10')).toBeDefined();
  });

  it('should show available status when not full', () => {
    render(<ProgressBar current={3} max={10} />);
    expect(screen.getByText('● متاحة - يمكن الانضمام')).toBeDefined();
  });

  it('should show full status when at capacity', () => {
    render(<ProgressBar current={10} max={10} />);
    expect(screen.getByText('● ممتلئة - لا يمكن الانضمام')).toBeDefined();
  });

  it('should render compact variant without status text', () => {
    render(<ProgressBar current={5} max={10} size="sm" />);
    expect(screen.queryByText('● متاحة - يمكن الانضمام')).toBeNull();
    expect(screen.getByText('5 / 10')).toBeDefined();
  });

  it('should render with 0 members', () => {
    render(<ProgressBar current={0} max={5} />);
    expect(screen.getByText('0 / 5')).toBeDefined();
  });
});
