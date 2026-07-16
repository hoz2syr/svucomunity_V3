import { getErrorMessage, getSupabaseClient, hasSupabaseEnv, missingSupabaseEnvMessage } from '../lib/supabase';
import type { Notification, NotificationType, NotificationPriority } from '../types/notification';
import type { SupabaseOperationError } from '../types/supabase';

export type FetchNotificationsResult = {
  data: Notification[];
  error: SupabaseOperationError | null;
};

const createMissingEnvError = (): SupabaseOperationError => ({
  message: missingSupabaseEnvMessage,
});

const mapNotificationRow = (row: Record<string, unknown>): Notification => ({
  id: String(row.id),
  user_id: String(row.user_id),
  title: String(row.title ?? ''),
  body: String(row.body ?? ''),
  read: Boolean(row.read ?? false),
  type: String(row.type ?? 'user') as NotificationType,
  created_by: row.created_by ? String(row.created_by) : null,
  priority: String(row.priority ?? 'normal') as NotificationPriority,
  createdAt: String(row.created_at ?? ''),
});

export const fetchNotifications = async (
  userId: string,
): Promise<FetchNotificationsResult> => {
  if (!hasSupabaseEnv()) {
    return { data: [], error: createMissingEnvError() };
  }

  try {
    const client = await getSupabaseClient();
    const { data, error } = await client
      .from('notifications')
      .select('id, user_id, title, body, read, type, created_by, priority, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      return { data: [], error };
    }

    const notifications: Notification[] = (data ?? []).map(mapNotificationRow);

    return { data: notifications, error: null };
  } catch (error) {
    return { data: [], error: { message: getErrorMessage(error) } };
  }
};

export const markAsRead = async (id: string): Promise<SupabaseOperationError | null> => {
  if (!hasSupabaseEnv()) {
    return createMissingEnvError();
  }

  try {
    const client = await getSupabaseClient();
    const { error } = await client
      .from('notifications')
      .update({ read: true })
      .eq('id', id);

    if (error) {
      return error;
    }

    return null;
  } catch (error) {
    return { message: getErrorMessage(error) };
  }
};

export const markAllRead = async (
  userId: string,
): Promise<SupabaseOperationError | null> => {
  if (!hasSupabaseEnv()) {
    return createMissingEnvError();
  }

  try {
    const client = await getSupabaseClient();
    const { error } = await client
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      return error;
    }

    return null;
  } catch (error) {
    return { message: getErrorMessage(error) };
  }
};

export const deleteNotification = async (
  id: string,
): Promise<SupabaseOperationError | null> => {
  if (!hasSupabaseEnv()) {
    return createMissingEnvError();
  }

  try {
    const client = await getSupabaseClient();
    const { error } = await client
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) {
      return error;
    }

    return null;
  } catch (error) {
    return { message: getErrorMessage(error) };
  }
};

