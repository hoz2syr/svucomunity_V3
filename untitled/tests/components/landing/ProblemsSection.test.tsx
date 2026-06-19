import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';

const mockUseInView = vi.fn();
vi.mock('@/src/hooks/useInView', () => ({
  useInView: (...args: any[]) => mockUseInView(...args),
}));

describe('ProblemsSection', () => {
  beforeEach(() => {
    vi.resetModules();
    mockUseInView.mockReturnValue({ ref: { current: null }, isInView: true });
  });

  it('should be importable', async () => {
    const mod = await import('@/src/components/landing/ProblemsSection');
    expect(mod.ProblemsSection).toBeDefined();
  });

  it('should render content', async () => {
    const { ProblemsSection } = await import('@/src/components/landing/ProblemsSection');
    const { container } = render(<ProblemsSection />);
    expect(container.querySelector('section')).toBeTruthy();
  });
});