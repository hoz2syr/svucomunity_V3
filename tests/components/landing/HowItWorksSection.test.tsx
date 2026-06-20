import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';

const mockUseInView = vi.fn();
vi.mock('@/src/hooks/useInView', () => ({
  useInView: (...args: any[]) => mockUseInView(...args),
}));

describe('HowItWorksSection', () => {
  beforeEach(() => {
    vi.resetModules();
    mockUseInView.mockReturnValue({ ref: { current: null }, isInView: true });
  });

  it('should be importable', async () => {
    const mod = await import('@/src/components/landing/HowItWorksSection');
    expect(mod.HowItWorksSection).toBeDefined();
  });

  it('should render content', async () => {
    const { HowItWorksSection } = await import('@/src/components/landing/HowItWorksSection');
    const { container } = render(<HowItWorksSection />);
    expect(container.querySelector('section')).toBeTruthy();
  });
});