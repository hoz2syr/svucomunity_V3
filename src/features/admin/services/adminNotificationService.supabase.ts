import { hasSupabaseEnv, getSupabaseClient } from '@/src/lib/supabase';
import type { ServiceResult } from '@/src/types/admin';
import { ROLES } from '@/src/types/admin';

export type AdminNotification = {
  id: string;
  user_id: string;
  title: string;
  body: string;
  read: boolean;
  type: string;
  created_by: string | null;
  priority: string;
  created_at: string;
  profiles?: {
    id: string;
    full_name: string | null;
    email: string | null;
    username: string | null;
  } | null;
};

type NotificationRow = AdminNotification;

const mapRow = (row: Record<string, unknown>): NotificationRow => ({
  id: String(row.id),
  user_id: String(row.user_id),
  title: String(row.title ?? ''),
  body: String(row.body ?? ''),
  read: Boolean(row.read ?? false),
  type: String(row.type ?? 'user'),
  created_by: row.created_by ? String(row.created_by) : null,
  priority: String(row.priority ?? 'normal'),
  created_at: String(row.created_at ?? ''),
  profiles: row.profiles as NotificationRow['profiles'],
});

export async function listAllNotifications(
  callerRole: string,
  page = 1,
  limit = 50,
  filters?: { type?: string; priority?: string; read?: boolean; search?: string },
): Promise<ServiceResult<NotificationRow[]>> {
  if (callerRole !== ROLES.ADMIN) {
    return { data: null, error: new Error('Unauthorized') };
  }

  if (!hasSupabaseEnv()) {
    return { data: null, error: new Error('Supabase not configured') };
  }

  const client = await getSupabaseClient();
  const from = (page - 1) * limit;

  let query = client
    .from('notifications')
    .select('id, user_id, title, body, read, type, created_by, priority, created_at, profiles:profiles!left(full_name, email, username)')
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1);

  if (filters?.type) {
    query = query.eq('type', filters.type);
  }

  if (filters?.priority) {
    query = query.eq('priority', filters.priority);
  }

  if (filters?.read !== undefined) {
    query = query.eq('read', filters.read);
  }

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,body.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  const notifications: NotificationRow[] = ((data as unknown) as Record<string, unknown>[]).map(mapRow);

  return { data: notifications, error: null };
}

export async function createAdminNotification(
  callerRole: string,
  callerId: string,
  input: {
    user_id: string;
    title: string;
    body: string;
    type?: string;
    priority?: string;
  },
): Promise<ServiceResult<NotificationRow>> {
  if (callerRole !== ROLES.ADMIN) {
    return { data: null, error: new Error('Unauthorized') };
  }

  if (!hasSupabaseEnv()) {
    return { data: null, error: new Error('Supabase not configured') };
  }

  const client = await getSupabaseClient();

  const { data, error } = await client
    .from('notifications')
    .insert({
      user_id: input.user_id,
      title: input.title,
      body: input.body,
      type: input.type || 'admin_broadcast',
      priority: input.priority || 'normal',
      created_by: callerId,
      read: false,
    })
    .select('id, user_id, title, body, read, type, created_by, priority, created_at, profiles:profiles!left(full_name, email, username)')
    .single();

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  return { data: mapRow(data as Record<string, unknown>), error: null };
}

export async function broadcastToAllUsers(
  callerRole: string,
  callerId: string,
  input: {
    title: string;
    body: string;
    priority?: string;
  },
): Promise<ServiceResult<NotificationRow[]>> {
  if (callerRole !== ROLES.ADMIN) {
    return { data: null, error: new Error('Unauthorized') };
  }

  if (!hasSupabaseEnv()) {
    return { data: null, error: new Error('Supabase not configured') };
  }

  const client = await getSupabaseClient();

  const { data: profiles, error: profilesError } = await client
    .from('profiles')
    .select('id');

  if (profilesError) {
    return { data: null, error: new Error(profilesError.message) };
  }

  const userIds = (profiles || []).map((p) => p.id as string);

  const rows = userIds.map((userId) => ({
    user_id: userId,
    title: input.title,
    body: input.body,
    type: 'admin_broadcast',
    priority: input.priority || 'normal',
    created_by: callerId,
    read: false,
  }));

  const { data, error } = await client
    .from('notifications')
    .insert(rows)
    .select('id, user_id, title, body, read, type, created_by, priority, created_at, profiles:profiles!left(full_name, email, username)');

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  const notifications: NotificationRow[] = ((data as unknown) as Record<string, unknown>[]).map(mapRow);

  return { data: notifications, error: null };
}

export async function deleteAnyNotificationAdmin(
  callerRole: string,
  notificationId: string,
): Promise<ServiceResult<null>> {
  if (callerRole !== ROLES.ADMIN) {
    return { data: null, error: new Error('Unauthorized') };
  }

  if (!hasSupabaseEnv()) {
    return { data: null, error: new Error('Supabase not configured') };
  }

  const client = await getSupabaseClient();

  const { error } = await client
    .from('notifications')
    .delete()
    .eq('id', notificationId);

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  return { data: null, error: null };
}

export async function markNotificationAsReadAdmin(
  callerRole: string,
  notificationId: string,
): Promise<ServiceResult<NotificationRow>> {
  if (callerRole !== ROLES.ADMIN) {
    return { data: null, error: new Error('Unauthorized') };
  }

  if (!hasSupabaseEnv()) {
    return { data: null, error: new Error('Supabase not configured') };
  }

  const client = await getSupabaseClient();

  const { data, error } = await client
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
    .select('id, user_id, title, body, read, type, created_by, priority, created_at, profiles:profiles!left(full_name, email, username)')
    .single();

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  return { data: mapRow(data as Record<string, unknown>), error: null };
}

export async function getNotificationStats(
  callerRole: string,
): Promise<ServiceResult<{ total: number; unread: number; broadcasts: number; userNotifications: number }>> {
  if (callerRole !== ROLES.ADMIN) {
    return { data: null, error: new Error('Unauthorized') };
  }

  if (!hasSupabaseEnv()) {
    return { data: null, error: new Error('Supabase not configured') };
  }

  const client = await getSupabaseClient();

  const { count: total, error: totalError } = await client
    .from('notifications')
    .select('*', { count: 'exact', head: true });

  if (totalError) {
    return { data: null, error: new Error(totalError.message) };
  }

  const { count: unread, error: unreadError } = await client
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('read', false);

  if (unreadError) {
    return { data: null, error: new Error(unreadError.message) };
  }

  const { count: broadcasts, error: broadcastsError } = await client
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('type', 'admin_broadcast');

  if (broadcastsError) {
    return { data: null, error: new Error(broadcastsError.message) };
  }

  const { count: userNotifications, error: userNotificationsError } = await client
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('type', 'user');

  if (userNotificationsError) {
    return { data: null, error: new Error(userNotificationsError.message) };
  }

  return {
    data: {
      total: total || 0,
      unread: unread || 0,
      broadcasts: broadcasts || 0,
      userNotifications: userNotifications || 0,
    },
    error: null,
  };
}
