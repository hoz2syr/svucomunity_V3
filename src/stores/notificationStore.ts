/**
 * @module stores/notificationStore
 *
 * @deprecated Zustand store for in-app notifications.
 *
 * PLANNED — not wired to any component yet. Currently only exported; no consumer
 * in `src/` imports `useNotificationStore`. This is intentional "Zustand drift":
 * the store is reserved for a future in-app notification system that will be
 * populated by `src/services/notification.service.ts`.
 *
 * NOTE: The store API surface (`items`, `unreadCount`, `add`, `markRead`, etc.)
 * differs from the `Notification` type exported by `src/types/notification.ts`.
 * Before wiring up, reconcile the two interfaces.
 *
 * When wiring up:
 *   1. Align store shape with the `Notification` type in `src/types/notification.ts`.
 *   2. Connect `add` to real-time Supabase notifications subscription.
 *   3. Remove or promote this file once a consumer exists.
 *
 * Do NOT delete this file until a component actually uses it — removing it will
 * silently break any planned feature that imports it.
 */

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
