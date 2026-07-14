import type { SubjectReference, SubjectReferenceInsert, UserCourseProgress, UserCourseProgressInsert } from '../types';
import { hasSupabaseEnv } from '@/src/lib/env';
import { getSupabaseClient } from '@/src/lib/supabase';

export type ServiceResult<T> = { data: T | null; error: Error | null };

export async function getReferencesByCourseCode(courseCode: string): Promise<ServiceResult<SubjectReference[]>> {
  if (!hasSupabaseEnv()) {
    return { data: null, error: new Error('Supabase environment not configured') };
  }
  try {
    const client = await getSupabaseClient();
    const { data, error } = await client
      .from('subject_references')
      .select('*')
      .eq('course_code', courseCode)
      .order('created_at', { ascending: false });

    if (error) return { data: null, error: new Error(error.message) };
    return { data: (data || []) as SubjectReference[], error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error('Failed to fetch references') };
  }
}

export async function insertReference(
  userId: string,
  reference: SubjectReferenceInsert
): Promise<ServiceResult<SubjectReference>> {
  if (!hasSupabaseEnv()) {
    return { data: null, error: new Error('Supabase environment not configured') };
  }
  try {
    const client = await getSupabaseClient();
    const { data, error } = await client
      .from('subject_references')
      .insert({ ...reference, user_id: userId })
      .select()
      .single();

    if (error) return { data: null, error: new Error(error.message) };
    return { data: data as SubjectReference, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error('Failed to insert reference') };
  }
}

export async function deleteReference(id: string): Promise<ServiceResult<null>> {
  if (!hasSupabaseEnv()) {
    return { data: null, error: new Error('Supabase environment not configured') };
  }
  try {
    const client = await getSupabaseClient();
    const { error } = await client.from('subject_references').delete().eq('id', id);
    if (error) return { data: null, error: new Error(error.message) };
    return { data: null, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error('Failed to delete reference') };
  }
}

export async function loadUserProgress(userId: string): Promise<ServiceResult<UserCourseProgress[]>> {
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

export async function upsertUserProgress(
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
    return { data: null, error: error instanceof Error ? error : new Error('Failed to upsert progress') };
  }
}

export async function deleteUserProgress(userId: string, courseCode: string): Promise<ServiceResult<null>> {
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
