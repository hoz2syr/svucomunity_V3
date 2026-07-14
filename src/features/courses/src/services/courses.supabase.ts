import type { UserCourseProgress, UserCourseProgressInsert } from '@/src/types/database';
import { hasSupabaseEnv } from '@/src/lib/env';
import { getSupabaseClient } from '@/src/lib/supabase';

export type ServiceResult<T> = { data: T | null; error: Error | null };

export async function loadProgress(userId: string): Promise<ServiceResult<UserCourseProgress[]>> {
  if (!hasSupabaseEnv()) {
    return { data: null, error: new Error('Supabase environment not configured') };
  }
  try {
    const client = await getSupabaseClient();
    const { data, error } = await client
      .from('user_course_progress')
      .select('*')
      .eq('user_id', userId);

    if (error) return { data: null, error: new Error(error.message) };
    return { data: (data || []) as UserCourseProgress[], error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error('Failed to load progress') };
  }
}

export async function saveProgress(
  userId: string,
  progress: UserCourseProgressInsert
): Promise<ServiceResult<UserCourseProgress>> {
  if (!hasSupabaseEnv()) {
    return { data: null, error: new Error('Supabase environment not configured') };
  }
  try {
    const client = await getSupabaseClient();
    const { data, error } = await client
      .from('user_course_progress')
      .upsert({ ...progress, user_id: userId, updated_at: new Date().toISOString() })
      .select()
      .single();

    if (error) return { data: null, error: new Error(error.message) };
    return { data: data as UserCourseProgress, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error('Failed to save progress') };
  }
}

export async function deleteProgress(
  userId: string,
  courseCode: string
): Promise<ServiceResult<null>> {
  if (!hasSupabaseEnv()) {
    return { data: null, error: new Error('Supabase environment not configured') };
  }
  try {
    const client = await getSupabaseClient();
    const { error } = await client
      .from('user_course_progress')
      .delete()
      .eq('user_id', userId)
      .eq('course_code', courseCode);

    if (error) return { data: null, error: new Error(error.message) };
    return { data: null, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error('Failed to delete progress') };
  }
}
