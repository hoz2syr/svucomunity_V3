import { hasSupabaseEnv, getSupabaseClient } from '@/src/lib/supabase';
import type { Profile } from '@/src/types/database';
import type { ServiceResult, PaginatedServiceResult, RawExtractionDetail } from '@/src/types/admin';
import { ROLES } from '@/src/types/admin';
import { logAdminAction } from './adminAudit';

export type AdminUser = Profile & {
  extraction_count?: number;
  last_extraction_at?: string | null;
};

export async function listAllUsers(
  callerId: string,
  callerRole: string,
  page = 1,
  limit = 50
): Promise<PaginatedServiceResult<AdminUser>> {
  if (callerRole !== ROLES.ADMIN) {
    return { data: null, totalCount: 0, error: new Error('Unauthorized') };
  }

  if (!hasSupabaseEnv()) {
    return { data: null, totalCount: 0, error: new Error('Supabase not configured') };
  }
  const client = await getSupabaseClient();

  const from = (page - 1) * limit;
  const { data, error } = await client
    .from('profiles')
    .select('id, full_name, email, username, role, provider, provider_id, major, created_at, updated_at')
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1);

  if (error) {
    return { data: null, totalCount: 0, error: new Error(error.message) };
  }

  const { count, error: countError } = await client
    .from('profiles')
    .select('id', { count: 'exact', head: true });

  if (countError) {
    return { data: null, totalCount: 0, error: new Error(countError.message) };
  }

  await logAdminAction(callerId, 'list_all_users', { page, limit });

  return { data: data as AdminUser[], totalCount: count || 0, error: null };
}

export async function updateUserRole(
  userId: string,
  newRole: string,
  callerId: string,
  callerRole: string
): Promise<ServiceResult<Profile>> {
  if (callerRole !== ROLES.ADMIN) {
    return { data: null, error: new Error('Unauthorized') };
  }

  if (userId === callerId) {
    return { data: null, error: new Error('Cannot change your own role') };
  }

  if (!Object.values(ROLES).includes(newRole as typeof ROLES[keyof typeof ROLES])) {
    return { data: null, error: new Error('Invalid role') };
  }

  if (!hasSupabaseEnv()) {
    return { data: null, error: new Error('Supabase not configured') };
  }
  const client = await getSupabaseClient();

  const { data, error } = await client
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  await logAdminAction(callerId, 'update_user_role', { userId, newRole });

  return { data: data as Profile, error: null };
}

export async function getUserDetails(
  userId: string,
  callerRole: string
): Promise<ServiceResult<AdminUser & { raw_extractions: RawExtractionDetail[] }>> {
  if (callerRole !== ROLES.ADMIN) {
    return { data: null, error: new Error('Unauthorized') };
  }

  if (!hasSupabaseEnv()) {
    return { data: null, error: new Error('Supabase not configured') };
  }
  const client = await getSupabaseClient();

  const { data: profile, error: profileError } = await client
    .from('profiles')
    .select('id, full_name, email, username, role, provider, provider_id, major, created_at, updated_at')
    .eq('id', userId)
    .single();

  if (profileError) {
    return { data: null, error: new Error(profileError.message) };
  }

  const { data: extractions, error: extractionsError } = await client
    .from('raw_extractions')
    .select('id, user_id, created_at, detected_schema')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (extractionsError) {
    const message = extractionsError.message || '';
    if (message.includes('schema cache') || message.includes('Could not find the table')) {
      return {
        data: {
          ...(profile as Profile),
          raw_extractions: [],
          extraction_count: 0,
          last_extraction_at: null,
        },
        error: null,
      };
    }
    return { data: null, error: new Error(extractionsError.message) };
  }

  const raw_extractions: RawExtractionDetail[] = (extractions || []).map((e) => ({
    ...e,
    course_count: 0,
  }));

  if (raw_extractions.length > 0) {
    const userIds = raw_extractions.map((e) => e.user_id);
    const { data: semesters, error: countError } = await client
      .from('student_semesters')
      .select('user_id, course_count')
      .in('user_id', userIds);

    if (countError) {
      return { data: null, error: new Error(countError.message) };
    }

    const userCourseCount = new Map<string, number>();
    for (const s of semesters || [] as { user_id: string; course_count: number }[]) {
      userCourseCount.set(s.user_id, (userCourseCount.get(s.user_id) || 0) + (s.course_count || 0));
    }
    for (const extraction of raw_extractions) {
      extraction.course_count = userCourseCount.get(extraction.user_id) || 0;
    }
  }

  return {
    data: {
      ...(profile as Profile),
      raw_extractions,
      extraction_count: extractions?.length || 0,
      last_extraction_at: extractions?.[0]?.created_at || null,
    },
    error: null,
  };
}

export async function getUserRoleCounts(
  callerId: string,
  callerRole: string
): Promise<ServiceResult<{ admin: number; user: number; student: number }>> {
  if (callerRole !== ROLES.ADMIN) {
    return { data: null, error: new Error('Unauthorized') };
  }

  if (!hasSupabaseEnv()) {
    return { data: null, error: new Error('Supabase not configured') };
  }
  const client = await getSupabaseClient();

  const { data, error } = await client
    .from('profiles')
    .select('role');

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  const counts = { admin: 0, user: 0, student: 0 };
  for (const profile of data || []) {
    const role = profile.role || 'user';
    if (role === 'admin') counts.admin++;
    else if (role === 'student') counts.student++;
    else counts.user++;
  }

  await logAdminAction(callerId, 'get_user_role_counts', {});

  return { data: counts, error: null };
}
