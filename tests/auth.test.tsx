import React from 'react';
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginPage } from '../src/pages/Login';
import { RegisterPage } from '../src/pages/Register';
import { AuthCallback } from '../src/pages/AuthCallback';
import { ForgotPasswordModal } from '../src/components/shared/ForgotPasswordModal';
import { GuestProvider } from '../src/contexts/GuestContext';

const missingSupabaseEnvMessage = 'Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local';

const envMocks = vi.hoisted(() => ({
  hasSupabaseEnv: vi.fn(() => true),
  missingSupabaseEnvMessage: 'Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local',
  getErrorMessage: (error: unknown, fallback = 'حدث خطأ غير متوقع.') => error instanceof Error ? error.message : typeof error === 'string' ? error : fallback,
}));

const authServiceMocks = vi.hoisted(() => ({
  loginWithPassword: vi.fn(),
  loginWithGoogle: vi.fn(),
  registerWithEmail: vi.fn(),
  resetPassword: vi.fn(),
  completeAuthCallback: vi.fn(),
}));

vi.mock('../src/services/environment.service', () => envMocks);
vi.mock('../src/services/auth.service', () => authServiceMocks);

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

const renderWithProviders = (ui: React.ReactElement) =>
  render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <GuestProvider>
          {ui}
        </GuestProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );

const fillLoginForm = () => {
  fireEvent.change(screen.getByLabelText('البريد الإلكتروني'), { target: { value: 'user@example.com' } });
  fireEvent.change(screen.getByLabelText('كلمة المرور'), { target: { value: 'Password123!' } });
};

beforeAll(() => {
  window.matchMedia = window.matchMedia || vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
});

describe('Auth pages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    envMocks.hasSupabaseEnv.mockReturnValue(true);
    authServiceMocks.loginWithPassword.mockResolvedValue({ data: null, error: null });
    authServiceMocks.loginWithGoogle.mockResolvedValue({ data: null, error: null });
    authServiceMocks.registerWithEmail.mockResolvedValue({ data: null, error: null });
    authServiceMocks.resetPassword.mockResolvedValue({ data: null, error: null });
    authServiceMocks.completeAuthCallback.mockResolvedValue({ data: { session: null }, error: null });
  });

  it('renders login form fields', () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByLabelText('البريد الإلكتروني')).toBeTruthy();
    expect(screen.getByLabelText('كلمة المرور')).toBeTruthy();
  });

  it('calls loginWithPassword on login submit', async () => {
    renderWithProviders(<LoginPage />);

    fillLoginForm();
    fireEvent.click(screen.getByRole('button', { name: 'تسجيل الدخول' }));

    await waitFor(() => expect(authServiceMocks.loginWithPassword).toHaveBeenCalledWith('user@example.com', 'Password123!'));
  });

  it('shows a clear error when Supabase environment is missing on login', async () => {
    envMocks.hasSupabaseEnv.mockReturnValue(false);
    renderWithProviders(<LoginPage />);

    fillLoginForm();
    fireEvent.click(screen.getByRole('button', { name: 'تسجيل الدخول' }));

    await waitFor(() => expect(screen.getByText(missingSupabaseEnvMessage)).toBeTruthy());
    expect(authServiceMocks.loginWithPassword).not.toHaveBeenCalled();
  });

  it('renders register form fields and submits registration', async () => {
    renderWithProviders(<RegisterPage />);

    fireEvent.change(screen.getByLabelText('الاسم الكامل'), { target: { value: 'طالب' } });
    fireEvent.change(screen.getByLabelText('البريد الإلكتروني'), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText('كلمة المرور'), { target: { value: 'Password123!' } });
    fireEvent.click(screen.getByRole('button', { name: 'إنشاء الحساب' }));

    await waitFor(() => expect(authServiceMocks.registerWithEmail).toHaveBeenCalledWith('طالب', 'user@example.com', 'Password123!'));
  });

  it('sends forgot password reset request', async () => {
    renderWithProviders(<ForgotPasswordModal isOpen onClose={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('البريد الإلكتروني'), { target: { value: 'user@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'إرسال رابط الاستعادة' }));

    await waitFor(() => expect(authServiceMocks.resetPassword).toHaveBeenCalledWith('user@example.com'));
    expect(await screen.findByText(/تم إرسال رابط الاستعادة/)).toBeTruthy();
  });

  it('renders callback loading and error states', async () => {
    authServiceMocks.completeAuthCallback.mockResolvedValue({
      data: { session: null },
      error: { message: 'فشل المصادقة' },
    });

    renderWithProviders(<AuthCallback />);

    expect(screen.getByText('جاري تسجيل الدخول...')).toBeTruthy();
    expect(await screen.findByText('فشل المصادقة')).toBeTruthy();
  });
});
