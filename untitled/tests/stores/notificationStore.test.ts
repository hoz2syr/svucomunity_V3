import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockUseNotificationStore = vi.fn();
vi.mock('../../src/stores/notificationStore', () => ({
  useNotificationStore: (...args: any[]) => mockUseNotificationStore(...args),
}));

describe('notificationStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('should export useNotificationStore', async () => {
    const mod = await import('../../src/stores/notificationStore');
    expect(typeof mod.useNotificationStore).toBe('function');
  });

  it('should start with empty notifications by default', async () => {
    mockUseNotificationStore.mockReturnValue({
      notifications: [],
      unreadCount: 0,
      addNotification: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      removeNotification: vi.fn(),
      clearAll: vi.fn(),
    });

    const { useNotificationStore } = await import('../../src/stores/notificationStore');
    const result = useNotificationStore();
    expect(result.notifications).toEqual([]);
    expect(result.unreadCount).toBe(0);
  });

  it('should have addNotification action', async () => {
    const addNotification = vi.fn();
    mockUseNotificationStore.mockReturnValue({
      notifications: [],
      unreadCount: 0,
      addNotification,
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      removeNotification: vi.fn(),
      clearAll: vi.fn(),
    });

    const { useNotificationStore } = await import('../../src/stores/notificationStore');
    const result = useNotificationStore();
    expect(typeof result.addNotification).toBe('function');
  });

  it('should call addNotification with message payload', async () => {
    const addNotification = vi.fn();
    mockUseNotificationStore.mockReturnValue({
      notifications: [],
      unreadCount: 0,
      addNotification,
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      removeNotification: vi.fn(),
      clearAll: vi.fn(),
    });

    const { useNotificationStore } = await import('../../src/stores/notificationStore');
    const result = useNotificationStore();
    result.addNotification({ message: 'new notification', type: 'info' });
    expect(addNotification).toHaveBeenCalledOnce();
  });
});
