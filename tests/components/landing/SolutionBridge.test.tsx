import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';

const mockUseInView = vi.fn();
vi.mock('@/src/hooks/useInView', () => ({
  useInView: (...args: any[]) => mockUseInView(...args),
}));

const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
});
window.IntersectionObserver = mockIntersectionObserver;

describe('SolutionBridge', () => {
  beforeEach(() => {
    vi.resetModules();
    mockUseInView.mockReturnValue({ ref: { current: null }, isInView: true });
    mockIntersectionObserver.mockClear();
  });

  it('should be importable', async () => {
    const mod = await import('@/src/components/landing/SolutionBridge');
    expect(mod.SolutionBridge).toBeDefined();
  });

  it('should render content', async () => {
    const { SolutionBridge } = await import('@/src/components/landing/SolutionBridge');
    const { container } = render(<SolutionBridge />);
    expect(container.querySelector('section')).toBeTruthy();
  });
});