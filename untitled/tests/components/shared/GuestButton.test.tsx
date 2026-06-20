import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockEnableGuestMode = vi.fn();
const mockNavigate = vi.fn();

vi.mock('@/src/contexts/GuestContext', () => ({
  useGuest: () => ({
    isGuest: false,
    enableGuestMode: mockEnableGuestMode,
    disableGuestMode: vi.fn(),
  }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderWithRouter = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('GuestButton', () => {
  beforeEach(() => {
    vi.resetModules();
    mockEnableGuestMode.mockClear();
    mockNavigate.mockClear();
  });

  it('should be importable', async () => {
    const mod = await import('@/src/components/shared/GuestButton');
    expect(mod.GuestButton).toBeDefined();
  });

  it('should render with default label', async () => {
    const { GuestButton } = await import('@/src/components/shared/GuestButton');
    renderWithRouter(<GuestButton />);
    expect(screen.getByText('تجربة المخطط كزائر')).toBeTruthy();
  });

  it('should enable guest mode and navigate to dashboard on click', async () => {
    const { GuestButton } = await import('@/src/components/shared/GuestButton');
    renderWithRouter(<GuestButton />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockEnableGuestMode).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
  });
});
