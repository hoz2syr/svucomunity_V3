import React from 'react';
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DashboardPage } from '../src/pages/Dashboard';

beforeAll(() => {
  window.matchMedia = window.matchMedia || vi.fn().mockImplementation(() => ({
    matches: false,
    media: '',
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

const authMock = vi.hoisted(() => ({
  session: null,
  profile: null,
  loading: false,
  refreshProfile: vi.fn(),
  envMissing: false,
}));

vi.mock('../src/contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => ({ ...authMock }),
}));

const supabaseMocks = vi.hoisted(() => ({
  signOut: vi.fn(),
  from: vi.fn(() => ({
    select: () => ({
      order: () => ({
        limit: () => Promise.resolve({ data: notificationsData.data, error: notificationsData.error }),
      }),
    }),
  })),
}));

const notificationsData: { data: unknown[]; error: null | { message: string } } = {
  data: [],
  error: null,
};

vi.mock('../src/lib/supabase', () => ({
  getErrorMessage: (error: unknown, fallback = 'حدث خطأ غير متوقع.') => error instanceof Error ? error.message : typeof error === 'string' ? error : fallback,
  hasSupabaseEnv: vi.fn(() => true),
  missingSupabaseEnvMessage: 'Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local',
  getSupabaseClient: vi.fn(() => ({
    auth: {
      signOut: (...args: unknown[]) => supabaseMocks.signOut(...args),
      getSession: vi.fn(() => Promise.resolve({ data: { session: { user: { id: '1', email: 't@t.com' } } }, error: null })),
      getUser: vi.fn(() => Promise.resolve({ data: { user: { id: '1', email: 't@t.com' } }, error: null })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    from: (...args: unknown[]) => supabaseMocks.from(...args),
    functions: {
      invoke: vi.fn(),
    },
  })),
  deleteOwnAccount: vi.fn(() => Promise.resolve({ ok: true })),
}));

const renderWithProviders = (ui: React.ReactElement) =>
  render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    </MemoryRouter>
  );

const openNotifications = async () => {
  fireEvent.click(screen.getByRole('button', { name: 'الإشعارات' }));
  await waitFor(() => expect(screen.getByText('الإشعارات')).toBeTruthy());
};

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    notificationsData.data = [];
    notificationsData.error = null;
    authMock.session = { user: { id: '1', email: 't@t.com', user_metadata: { full_name: 'Test' } } };
    authMock.loading = false;
  });

  it('renders empty notifications state', async () => {
    renderWithProviders(<DashboardPage />);
    await openNotifications();
    expect(screen.getByText('لا توجد إشعارات')).toBeTruthy();
  });

  it('renders error state on notifications failure', async () => {
    notificationsData.data = [];
    notificationsData.error = { message: 'failed' };
    renderWithProviders(<DashboardPage />);
    await openNotifications();
    await waitFor(() => expect(screen.getByText('تعذر تحميل الإشعارات')).toBeTruthy());
  });

  it('renders notification items', async () => {
    notificationsData.data = [
      { id: '1', title: 'إشعار 1', body: 'نص', read: false, created_at: '2024-01-01' },
    ];
    notificationsData.error = null;
    renderWithProviders(<DashboardPage />);
    await openNotifications();
    await waitFor(() => expect(screen.getByText('إشعار 1')).toBeTruthy());
  });

  it('opens profile menu and logout modal', async () => {
    renderWithProviders(<DashboardPage />);

    fireEvent.click(screen.getByLabelText('ملف Test'));
    expect(await screen.findByText('إعدادات الحساب')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'تسجيل الخروج' }));
    expect(screen.getByRole('heading', { name: 'تسجيل الخروج' })).toBeTruthy();
  });
});
