import { describe, expect, it, vi, beforeEach } from 'vitest';

const missingSupabaseEnvMessage = 'Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local';

const query = vi.hoisted(() => ({
  select: vi.fn(),
  order: vi.fn(),
  limit: vi.fn(),
}));

const client = vi.hoisted(() => ({
  from: vi.fn(() => query),
}));

const lib = vi.hoisted(() => ({
  getErrorMessage: (error: unknown, fallback = 'حدث خطأ غير متوقع.') => error instanceof Error ? error.message : typeof error === 'string' ? error : fallback,
  getSupabaseClient: vi.fn(() => client),
  hasSupabaseEnv: vi.fn(() => true),
  missingSupabaseEnvMessage: 'Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local',
}));

vi.mock('../../src/lib/supabase', () => lib);

describe('notification service', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    lib.hasSupabaseEnv.mockReturnValue(true);
    query.select.mockReturnThis();
    query.order.mockReturnThis();
    query.limit.mockResolvedValue({
      data: [
        { id: 1, title: 'إشعار', body: 'نص', read: false, created_at: '2026-01-01T00:00:00Z' },
      ],
      error: null,
    });
  });

  it('fetches notifications and maps them to the shared Notification type', async () => {
    const { fetchNotifications } = await import('../../src/services/notification.service');
    const result = await fetchNotifications();

    expect(result).toEqual({
      data: [{
        id: '1',
        title: 'إشعار',
        body: 'نص',
        read: false,
        createdAt: '2026-01-01T00:00:00Z',
      }],
      error: null,
    });
    expect(client.from).toHaveBeenCalledWith('notifications');
  });

  it('returns an empty list and typed missing-env error without calling Supabase', async () => {
    lib.hasSupabaseEnv.mockReturnValue(false);
    const { fetchNotifications } = await import('../../src/services/notification.service');

    await expect(fetchNotifications()).resolves.toEqual({
      data: [],
      error: { message: missingSupabaseEnvMessage },
    });
    expect(client.from).not.toHaveBeenCalled();
  });
});
