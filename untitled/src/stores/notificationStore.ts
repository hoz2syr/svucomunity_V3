import { create } from 'zustand';

export type Notification = {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
};

export type NotificationState = {
  items: Notification[];
  unreadCount: number;
};

export type NotificationActions = {
  add: (item: Notification) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  reset: () => void;
};

export type NotificationStore = NotificationState & NotificationActions;

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'مرحباً بك',
    body: 'تم إنشاء حسابك بنجاح',
    read: false,
    createdAt: new Date().toISOString(),
  },
];

export const useNotificationStore = create<NotificationStore>((set) => ({
  items: INITIAL_NOTIFICATIONS,
  unreadCount: INITIAL_NOTIFICATIONS.filter((n) => !n.read).length,
  add: (item) =>
    set((s) => ({
      items: [item, ...s.items],
      unreadCount: s.unreadCount + (item.read ? 0 : 1),
    })),
  markRead: (id) =>
    set((s) => {
      const exists = s.items.some((n) => n.id === id && !n.read);
      if (!exists) return s;
      return {
        items: s.items.map((n) => (n.id === id ? { ...n, read: true } : n)),
        unreadCount: Math.max(0, s.unreadCount - 1),
      };
    }),
  markAllRead: () =>
    set((s) => ({
      items: s.items.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),
  reset: () =>
    set({
      items: [],
      unreadCount: 0,
    }),
}));
