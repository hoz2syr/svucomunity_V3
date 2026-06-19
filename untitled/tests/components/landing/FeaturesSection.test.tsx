import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';

const mockUseInView = vi.fn();
vi.mock('@/src/hooks/useInView', () => ({
  useInView: (...args: any[]) => mockUseInView(...args),
}));

describe('FeaturesSection', () => {
  beforeEach(() => {
    vi.resetModules();
    mockUseInView.mockReturnValue({ ref: { current: null }, isInView: true });
  });

  it('should be importable', async () => {
    const mod = await import('@/src/components/landing/FeaturesSection');
    expect(mod.FeaturesSection).toBeDefined();
  });

  it('should render content', async () => {
    const { FeaturesSection } = await import('@/src/components/landing/FeaturesSection');
    const { container } = render(<FeaturesSection />);
    expect(container.querySelector('section')).toBeTruthy();
  });
});