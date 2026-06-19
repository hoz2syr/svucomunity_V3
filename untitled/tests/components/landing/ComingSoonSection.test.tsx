import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';

const mockUseInView = vi.fn();
vi.mock('@/src/hooks/useInView', () => ({
  useInView: (...args: any[]) => mockUseInView(...args),
}));

describe('ComingSoonSection', () => {
  beforeEach(() => {
    vi.resetModules();
    mockUseInView.mockReturnValue({ ref: { current: null }, isInView: true });
  });

  it('should be importable', async () => {
    const mod = await import('@/src/components/landing/ComingSoonSection');
    expect(mod.ComingSoonSection).toBeDefined();
  });

  it('should render content', async () => {
    const { ComingSoonSection } = await import('@/src/components/landing/ComingSoonSection');
    const { container } = render(<ComingSoonSection />);
    expect(container.querySelector('section')).toBeTruthy();
  });
});