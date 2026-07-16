import { hasSupabaseEnv, getSupabaseClient } from '@/src/lib/supabase';
import type { DiscoveredCourse, DiscoveredInstructor } from '@/src/types/database';
import type { ServiceResult } from '@/src/types/admin';

export async function verifyDiscoveredCourse(
  courseCode: string,
  isVerified: boolean,
  verifiedBy: string,
  callerRole: string
): Promise<ServiceResult<DiscoveredCourse>> {
  if (callerRole !== 'admin') {
    return { data: null, error: new Error('Unauthorized') };
  }

  if (!hasSupabaseEnv()) {
    return { data: null, error: new Error('Supabase not configured') };
  }
  const client = await getSupabaseClient();

  const { data, error } = await client
    .from('discovered_courses')
    .update({
      is_verified: isVerified,
      verified_at: isVerified ? new Date().toISOString() : null,
      verified_by: isVerified ? verifiedBy : null,
    })
    .eq('course_code', courseCode)
    .select()
    .single();

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  await logAdminAction(verifiedBy, 'verify_course', { courseCode, isVerified });

  return { data: data as DiscoveredCourse, error: null };
}

export async function verifyDiscoveredInstructor(
  instructorUsername: string,
  isVerified: boolean,
  verifiedBy: string,
  callerRole: string
): Promise<ServiceResult<DiscoveredInstructor>> {
  if (callerRole !== 'admin') {
    return { data: null, error: new Error('Unauthorized') };
  }

  if (!hasSupabaseEnv()) {
    return { data: null, error: new Error('Supabase not configured') };
  }
  const client = await getSupabaseClient();

  const { data, error } = await client
    .from('discovered_instructors')
    .update({
      is_verified: isVerified,
      verified_at: isVerified ? new Date().toISOString() : null,
      verified_by: isVerified ? verifiedBy : null,
    })
    .eq('instructor_username', instructorUsername)
    .select()
    .single();

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  await logAdminAction(verifiedBy, 'verify_instructor', { instructorUsername, isVerified });

  return { data: data as DiscoveredInstructor, error: null };
}

export async function loadUnverifiedCourses(
  callerRole: string
): Promise<ServiceResult<DiscoveredCourse[]>> {
  if (callerRole !== 'admin') {
    return { data: null, error: new Error('Unauthorized') };
  }

  if (!hasSupabaseEnv()) {
    return { data: null, error: new Error('Supabase not configured') };
  }
  const client = await getSupabaseClient();
  const { data, error } = await client
    .from('discovered_courses')
    .select('*')
    .eq('is_verified', false)
    .order('seen_count', { ascending: false });

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  return { data: data as DiscoveredCourse[], error: null };
}

export async function loadUnverifiedInstructors(
  callerRole: string
): Promise<ServiceResult<DiscoveredInstructor[]>> {
  if (callerRole !== 'admin') {
    return { data: null, error: new Error('Unauthorized') };
  }

  if (!hasSupabaseEnv()) {
    return { data: null, error: new Error('Supabase not configured') };
  }
  const client = await getSupabaseClient();
  const { data, error } = await client
    .from('discovered_instructors')
    .select('*')
    .eq('is_verified', false)
    .order('seen_count', { ascending: false });

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  return { data: data as DiscoveredInstructor[], error: null };
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
