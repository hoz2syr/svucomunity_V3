import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';

const mockUseInView = vi.fn();
vi.mock('@/src/hooks/useInView', () => ({
  useInView: (...args: any[]) => mockUseInView(...args),
}));

describe('ScrollIndicator', () => {
  beforeEach(() => {
    vi.resetModules();
    mockUseInView.mockReturnValue({ ref: { current: null }, isInView: true });
  });

  it('should be importable', async () => {
    const mod = await import('@/src/components/landing/ScrollIndicator');
    expect(mod.ScrollIndicator).toBeDefined();
  });

  it('should render content', async () => {
    const { ScrollIndicator } = await import('@/src/components/landing/ScrollIndicator');
    const { container } = render(<ScrollIndicator />);
    expect(container.innerHTML).toBeTruthy();
  });
});