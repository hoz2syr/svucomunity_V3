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

    const notifications: Notification[] = (data ?? []).map((row: Record<string, unknown>) => ({
      id: String(row.id),
      title: String(row.title ?? ''),
      body: String(row.body ?? ''),
      read: Boolean(row.read ?? false),
      createdAt: String(row.created_at ?? ''),
    }));

    return { data: notifications, error: null };
  } catch (error) {
    return { data: [], error: { message: getErrorMessage(error) } };
  }
};
