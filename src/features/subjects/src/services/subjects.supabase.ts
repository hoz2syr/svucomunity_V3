import type { SubjectReference, SubjectReferenceInsert, SubjectReferenceUpdate, UserCourseProgress, UserCourseProgressInsert } from '../types';
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
      .select('id, course_code, user_id, type, title, url, description, created_at, likes, is_approved')
      .eq('course_code', courseCode)
      .eq('is_approved', true)
      .order('likes', { ascending: false })
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
      .insert({ ...reference, user_id: userId, likes: 0, is_approved: true })
      .select('id, course_code, user_id, type, title, url, description, created_at, likes, is_approved')
      .single();

    if (error) return { data: null, error: new Error(error.message) };
    return { data: data as SubjectReference, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error('Failed to insert reference') };
  }
}

export async function updateReference(
  id: string,
  updates: SubjectReferenceUpdate
): Promise<ServiceResult<SubjectReference>> {
  if (!hasSupabaseEnv()) {
    return { data: null, error: new Error('Supabase environment not configured') };
  }
  try {
    const client = await getSupabaseClient();
    const { data, error } = await client
      .from('subject_references')
      .update(updates)
      .eq('id', id)
      .select('id, course_code, user_id, type, title, url, description, created_at, likes, is_approved')
      .single();

    if (error) return { data: null, error: new Error(error.message) };
    return { data: data as SubjectReference, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error('Failed to update reference') };
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

export async function likeReference(referenceId: string, userId: string): Promise<ServiceResult<null>> {
  if (!hasSupabaseEnv()) {
    return { data: null, error: new Error('Supabase environment not configured') };
  }
  try {
    const client = await getSupabaseClient();
    const { error } = await client
      .from('subject_reference_likes')
      .insert({ reference_id: referenceId, user_id: userId });

    if (error) return { data: null, error: new Error(error.message) };

    const { error: updateError } = await client
      .from('subject_references')
      .update({ likes: (await getReferenceLikes(referenceId)).data || 0 })
      .eq('id', referenceId);

    if (updateError) return { data: null, error: new Error(updateError.message) };
    return { data: null, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error('Failed to like reference') };
  }
}

export async function unlikeReference(referenceId: string, userId: string): Promise<ServiceResult<null>> {
  if (!hasSupabaseEnv()) {
    return { data: null, error: new Error('Supabase environment not configured') };
  }
  try {
    const client = await getSupabaseClient();
    const { error } = await client
      .from('subject_reference_likes')
      .delete()
      .eq('reference_id', referenceId)
      .eq('user_id', userId);

    if (error) return { data: null, error: new Error(error.message) };

    const { error: updateError } = await client
      .from('subject_references')
      .update({ likes: (await getReferenceLikes(referenceId)).data || 0 })
      .eq('id', referenceId);

    if (updateError) return { data: null, error: new Error(updateError.message) };
    return { data: null, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error('Failed to unlike reference') };
  }
}

async function getReferenceLikes(referenceId: string): Promise<ServiceResult<number>> {
  if (!hasSupabaseEnv()) {
    return { data: 0, error: new Error('Supabase environment not configured') };
  }
  try {
    const client = await getSupabaseClient();
    const { count, error } = await client
      .from('subject_reference_likes')
      .select('*', { count: 'exact', head: true })
      .eq('reference_id', referenceId);

    if (error) return { data: 0, error: new Error(error.message) };
    return { data: count || 0, error: null };
  } catch (error) {
    return { data: 0, error: error instanceof Error ? error : new Error('Failed to count likes') };
  }
}

export async function checkUserLikedReference(referenceId: string, userId: string): Promise<ServiceResult<boolean>> {
  if (!hasSupabaseEnv()) {
    return { data: false, error: new Error('Supabase environment not configured') };
  }
  try {
    const client = await getSupabaseClient();
    const { data, error } = await client
      .from('subject_reference_likes')
      .select('id')
      .eq('reference_id', referenceId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) return { data: false, error: new Error(error.message) };
    return { data: !!data, error: null };
  } catch (error) {
    return { data: false, error: error instanceof Error ? error : new Error('Failed to check like') };
  }
}

export async function fetchUserReferences(userId: string): Promise<ServiceResult<SubjectReference[]>> {
  if (!hasSupabaseEnv()) {
    return { data: null, error: new Error('Supabase environment not configured') };
  }
  try {
    const client = await getSupabaseClient();
    const { data, error } = await client
      .from('subject_references')
      .select('id, course_code, user_id, type, title, url, description, created_at, likes, is_approved')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) return { data: null, error: new Error(error.message) };
    return { data: (data || []) as SubjectReference[], error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error('Failed to fetch user references') };
  }
}

export async function fetchAllReferences(): Promise<ServiceResult<SubjectReference[]>> {
  if (!hasSupabaseEnv()) {
    return { data: null, error: new Error('Supabase environment not configured') };
  }
  try {
    const client = await getSupabaseClient();
    const { data, error } = await client
      .from('subject_references')
      .select('id, course_code, user_id, type, title, url, description, created_at, likes, is_approved')
      .order('created_at', { ascending: false });

    if (error) return { data: null, error: new Error(error.message) };
    return { data: (data || []) as SubjectReference[], error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error('Failed to fetch all references') };
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
      .select('user_id, course_code, status, updated_at')
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
      .select('user_id, course_code, status, updated_at')
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
