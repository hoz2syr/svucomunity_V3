import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockUseAuthForm = vi.fn();
const mockUseRateLimit = vi.fn();
const mockHasSupabaseEnv = vi.fn();
const mockLoginWithGoogle = vi.fn();
const mockLoginWithPassword = vi.fn();

vi.mock('@/src/hooks/useAuthForm', () => ({
  useAuthForm: (...args: any[]) => mockUseAuthForm(...args),
}));

vi.mock('@/src/hooks/useRateLimit', () => ({
  useRateLimit: (...args: any[]) => mockUseRateLimit(...args),
}));

vi.mock('@/src/services/environment.service', () => ({
  hasSupabaseEnv: (...args: any[]) => mockHasSupabaseEnv(...args),
  missingSupabaseEnvMessage: 'Missing Supabase environment variables',
}));

vi.mock('@/src/services/auth.service', () => ({
  loginWithGoogle: (...args: any[]) => mockLoginWithGoogle(...args),
  loginWithPassword: (...args: any[]) => mockLoginWithPassword(...args),
}));

vi.mock('@/src/contexts/GuestContext', () => ({
  useGuest: () => ({ isGuest: false, enableGuestMode: vi.fn(), disableGuestMode: vi.fn() }),
}));

const renderWithRouter = (ui: React.ReactElement) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);

describe('AuthPage', () => {
  beforeEach(() => {
    vi.resetModules();
    mockUseAuthForm.mockReturnValue({
      form: { watch: vi.fn(), setValue: vi.fn(), trigger: vi.fn() },
      handleSubmit: vi.fn().mockResolvedValue({ email: 'test@test.com', password: 'Password123!' }),
      isLoading: false,
      serverError: '',
      fieldErrors: {},
      clearServerError: vi.fn(),
      setServerError: vi.fn(),
    });
    mockUseRateLimit.mockReturnValue({ status: { blocked: false }, limiter: { recordAttempt: vi.fn() } });
    mockHasSupabaseEnv.mockReturnValue(true);
  });

  it('should be importable', async () => {
    const mod = await import('@/src/pages/Login');
    expect(mod.LoginPage).toBeDefined();
  });

  it('should render login form', async () => {
    const { LoginPage } = await import('@/src/pages/Login');
    renderWithRouter(<LoginPage />);
    const emailField = screen.queryByLabelText(/البريد الإلكتروني/i);
    expect(emailField || screen.queryByRole('button')).toBeTruthy();
  });
});