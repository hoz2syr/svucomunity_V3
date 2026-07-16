import { hasSupabaseEnv, getSupabaseClient } from '@/src/lib/supabase';
import type { Profile } from '@/src/types/database';
import type { ServiceResult, RawExtractionDetail } from '@/src/types/admin';
import { ROLES } from '@/src/types/admin';

export type AdminUser = Profile & {
  extraction_count?: number;
  last_extraction_at?: string;
};

export async function listAllUsers(
  callerRole: string
): Promise<ServiceResult<AdminUser[]>> {
  if (callerRole !== ROLES.ADMIN) {
    return { data: null, error: new Error('Unauthorized') };
  }

  if (!hasSupabaseEnv()) {
    return { data: null, error: new Error('Supabase not configured') };
  }
  const client = await getSupabaseClient();

  const { data, error } = await client
    .from('profiles')
    .select('id, full_name, email, username, role, provider, provider_id, major, created_at, updated_at')
    .order('created_at', { ascending: false });

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  return { data: data as AdminUser[], error: null };
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
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError) {
    return { data: null, error: new Error(profileError.message) };
  }

  const { data: extractions, error: extractionsError } = await client
    .from('raw_extractions')
    .select('id, created_at, detected_schema')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (extractionsError) {
    return { data: null, error: new Error(extractionsError.message) };
  }

  const raw_extractions: RawExtractionDetail[] = (extractions || []).map((e) => ({
    ...e,
    course_count: 0,
  }));

  if (raw_extractions.length > 0) {
    const extractionIds = raw_extractions.map((e) => e.id);
    const { data: courses, error: countError } = await client
      .from('extracted_courses')
      .select('extraction_id')
      .in('extraction_id', extractionIds);

    if (countError) {
      return { data: null, error: new Error(countError.message) };
    }

    const countMap = new Map<string, number>();
    for (const course of courses || []) {
      const id = course.extraction_id as string;
      countMap.set(id, (countMap.get(id) || 0) + 1);
    }
    for (const extraction of raw_extractions) {
      extraction.course_count = countMap.get(extraction.id) || 0;
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

async function logAdminAction(
  callerId: string,
  action: string,
  payload: Record<string, unknown>
): Promise<void> {
  if (!hasSupabaseEnv()) return;
  const client = await getSupabaseClient();

  let ipAddress = 'unknown';
  let userAgent = 'unknown';

  try {
    if (typeof window !== 'undefined') {
      userAgent = navigator.userAgent;
      const ipResponse = await fetch('/api/ip');
      if (ipResponse.ok) {
        const ipData = (await ipResponse.json()) as { ip: string };
        ipAddress = ipData.ip;
      }
    }
  } catch {
    // keep fallback values
  }

  await client.from('admin_audit_log').insert({
    caller_id: callerId,
    action,
    payload,
    ip_address: ipAddress,
    user_agent: userAgent,
  });
}
