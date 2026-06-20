import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';

const mockUseInView = vi.fn();
vi.mock('@/src/hooks/useInView', () => ({
  useInView: (...args: any[]) => mockUseInView(...args),
}));

describe('FadeIn', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('should be importable', async () => {
    const mod = await import('@/src/components/ui/FadeIn');
    expect(mod.FadeIn).toBeDefined();
  });

  it('should render children when in view', async () => {
    mockUseInView.mockReturnValue({ ref: { current: null }, isInView: true });
    const { FadeIn } = await import('@/src/components/ui/FadeIn');
    render(<FadeIn>Test Content</FadeIn>);
    expect(screen.queryByText('Test Content')).toBeTruthy();
  });
});
