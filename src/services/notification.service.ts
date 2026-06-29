import { getErrorMessage, getSupabaseClient, hasSupabaseEnv, missingSupabaseEnvMessage } from '../lib/supabase';
import type { Notification } from '../types/notification';
import type { SupabaseOperationError } from '../types/supabase';

export type FetchNotificationsResult = {
  data: Notification[];
  error: SupabaseOperationError | null;
};

const createMissingEnvError = (): SupabaseOperationError => ({
  message: missingSupabaseEnvMessage,
});

const updateNotificationRow = async (
  id: string,
  updates: Record<string, unknown>,
): Promise<SupabaseOperationError | null> => {
  if (!hasSupabaseEnv()) {
    return createMissingEnvError();
  }

  try {
    const { error } = await getSupabaseClient()
      .from('notifications')
      .update(updates)
      .eq('id', id);

    if (error) {
      return error;
    }

    return null;
  } catch (error) {
    return { message: getErrorMessage(error) };
  }
};

export const fetchNotifications = async (): Promise<FetchNotificationsResult> => {
  if (!hasSupabaseEnv()) {
    return { data: [], error: createMissingEnvError() };
  }

  try {
    const { data, error } = await getSupabaseClient()
      .from('notifications')
      .select('id, title, body, read, created_at')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      return { data: [], error };
    }

    const notifications: Notification[] = (data ?? []).map(
      (row: Record<string, unknown>) => ({
        id: String(row.id),
        title: String(row.title ?? ''),
        body: String(row.body ?? ''),
        read: Boolean(row.read ?? false),
        createdAt: String(row.created_at ?? ''),
      }),
    );

    return { data: notifications, error: null };
  } catch (error) {
    return { data: [], error: { message: getErrorMessage(error) } };
  }
};

export const markAsRead = async (id: string): Promise<SupabaseOperationError | null> =>
  updateNotificationRow(id, { read: true });

export const markAllRead = async (
  userId: string,
): Promise<SupabaseOperationError | null> => {
  if (!hasSupabaseEnv()) {
    return createMissingEnvError();
  }

  try {
    const { error } = await getSupabaseClient()
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
    const { error } = await getSupabaseClient()
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
