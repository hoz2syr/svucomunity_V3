import { describe, expect, it, vi, beforeEach } from 'vitest';

const missingSupabaseEnvMessage = 'Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local';

const createQueryMock = () => ({
  select: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
});

const client = vi.hoisted(() => ({
  from: vi.fn(() => createQueryMock()),
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
  });

  it('fetches notifications and maps them to the shared Notification type', async () => {
    const query = createQueryMock();
    client.from.mockReturnValue(query);
    query.limit.mockResolvedValue({
      data: [
        { id: 1, title: 'إشعار', body: 'نص', read: false, created_at: '2026-01-01T00:00:00Z' },
      ],
      error: null,
    });

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

  it('marks a single notification as read', async () => {
    const query = createQueryMock();
    client.from.mockReturnValue(query);
    query.eq.mockResolvedValue({ error: null });

    const { markAsRead } = await import('../../src/services/notification.service');
    const result = await markAsRead('notif-1');

    expect(result).toBeNull();
    expect(client.from).toHaveBeenCalledWith('notifications');
  });

  it('returns typed missing-env error for markAsRead when env is missing', async () => {
    lib.hasSupabaseEnv.mockReturnValue(false);
    const { markAsRead } = await import('../../src/services/notification.service');

    await expect(markAsRead('notif-1')).resolves.toEqual({
      message: missingSupabaseEnvMessage,
    });
  });

  it('marks all unread notifications as read for a user', async () => {
    const query = createQueryMock();
    client.from.mockReturnValue(query);

    const { markAllRead } = await import('../../src/services/notification.service');
    const result = await markAllRead('user-1');

    expect(result).toBeNull();
    expect(client.from).toHaveBeenCalledWith('notifications');
  });

  it('returns typed missing-env error for markAllRead when env is missing', async () => {
    lib.hasSupabaseEnv.mockReturnValue(false);
    const { markAllRead } = await import('../../src/services/notification.service');

    await expect(markAllRead('user-1')).resolves.toEqual({
      message: missingSupabaseEnvMessage,
    });
  });

  it('deletes a notification', async () => {
    const query = createQueryMock();
    client.from.mockReturnValue(query);
    query.eq.mockResolvedValue({ error: null });

    const { deleteNotification } = await import('../../src/services/notification.service');
    const result = await deleteNotification('notif-1');

    expect(result).toBeNull();
    expect(client.from).toHaveBeenCalledWith('notifications');
  });

  it('returns typed missing-env error for deleteNotification when env is missing', async () => {
    lib.hasSupabaseEnv.mockReturnValue(false);
    const { deleteNotification } = await import('../../src/services/notification.service');

    await expect(deleteNotification('notif-1')).resolves.toEqual({
      message: missingSupabaseEnvMessage,
    });
  });
});
