import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';

const mockUseInView = vi.fn();
vi.mock('@/src/hooks/useInView', () => ({
  useInView: (...args: any[]) => mockUseInView(...args),
}));

describe('HeroAddition', () => {
  beforeEach(() => {
    vi.resetModules();
    mockUseInView.mockReturnValue({ ref: { current: null }, isInView: true });
  });

  it('should be importable', async () => {
    const mod = await import('@/src/components/landing/HeroAddition');
    expect(mod.HeroAddition).toBeDefined();
  });

  it('should render content', async () => {
    const { HeroAddition } = await import('@/src/components/landing/HeroAddition');
    const { container } = render(<HeroAddition />);
    expect(container.innerHTML).toBeTruthy();
  });
});