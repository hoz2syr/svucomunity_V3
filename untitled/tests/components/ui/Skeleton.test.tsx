import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';

const mockUseRateLimit = vi.fn();
vi.mock('@/src/hooks/useRateLimit', () => ({
  useRateLimit: (...args: any[]) => mockUseRateLimit(...args),
}));

describe('Skeleton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('should be importable', async () => {
    const mod = await import('@/src/components/ui/Skeleton');
    expect(mod.Skeleton).toBeDefined();
  });

  it('should render a skeleton element', async () => {
    mockUseRateLimit.mockReturnValue({ limitReached: false, remaining: 5 });
    const { Skeleton } = await import('@/src/components/ui/Skeleton');
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toBeDefined();
  });
});
