import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockUseInView = vi.fn();
const mockUseGuest = vi.fn();
vi.mock('@/src/hooks/useInView', () => ({
  useInView: (...args: any[]) => mockUseInView(...args),
}));
vi.mock('@/src/contexts/GuestContext', () => ({
  useGuest: () => mockUseGuest(),
}));

describe('FinalCTASection', () => {
  beforeEach(() => {
    vi.resetModules();
    mockUseInView.mockReturnValue({ ref: { current: null }, isInView: true });
    mockUseGuest.mockReturnValue({ isGuest: false, enableGuestMode: vi.fn(), disableGuestMode: vi.fn() });
  });

  it('should be importable', async () => {
    const mod = await import('@/src/components/landing/FinalCTASection');
    expect(mod.FinalCTASection).toBeDefined();
  });

  it('should render content', async () => {
    const { FinalCTASection } = await import('@/src/components/landing/FinalCTASection');
    render(
      <MemoryRouter>
        <FinalCTASection />
      </MemoryRouter>
    );
    expect(document.querySelector('section')).toBeTruthy();
  });
});