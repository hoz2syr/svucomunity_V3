import { hasSupabaseEnv, getSupabaseClient } from '@/src/lib/supabase';
import type { DiscoveredCourse, DiscoveredInstructor } from '@/src/types/database';
import type { ServiceResult } from '@/src/types/admin';

function validateCourseCode(code: string): boolean {
  return typeof code === 'string' && code.trim().length > 0;
}

function validateInstructorUsername(username: string): boolean {
  return typeof username === 'string' && username.trim().length > 0;
}

export async function verifyDiscoveredCourse(
  courseCode: string,
  isVerified: boolean,
  verifiedBy: string,
  callerRole: string
): Promise<ServiceResult<DiscoveredCourse>> {
  if (callerRole !== 'admin') {
    return { data: null, error: new Error('Unauthorized') };
  }

  if (!validateCourseCode(courseCode)) {
    return { data: null, error: new Error('Invalid course code') };
  }

  if (!verifiedBy || typeof verifiedBy !== 'string') {
    return { data: null, error: new Error('Invalid verifier id') };
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
    .eq('course_code', courseCode.trim())
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

  if (!validateInstructorUsername(instructorUsername)) {
    return { data: null, error: new Error('Invalid instructor username') };
  }

  if (!verifiedBy || typeof verifiedBy !== 'string') {
    return { data: null, error: new Error('Invalid verifier id') };
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
    .eq('instructor_username', instructorUsername.trim())
    .select()
    .single();

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  await logAdminAction(verifiedBy, 'verify_instructor', { instructorUsername, isVerified });

  return { data: data as DiscoveredInstructor, error: null };
}

export async function loadUnverifiedCourses(
  callerRole: string,
  page = 1,
  limit = 50
): Promise<ServiceResult<DiscoveredCourse[]>> {
  if (callerRole !== 'admin') {
    return { data: null, error: new Error('Unauthorized') };
  }

  if (!hasSupabaseEnv()) {
    return { data: null, error: new Error('Supabase not configured') };
  }
  const client = await getSupabaseClient();
  const from = (page - 1) * limit;
  const { data, error } = await client
    .from('discovered_courses')
    .select('*')
    .eq('is_verified', false)
    .order('seen_count', { ascending: false })
    .range(from, from + limit - 1);

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  await logAdminAction(callerRole, 'load_unverified_courses', { page, limit });

  return { data: data as DiscoveredCourse[], error: null };
}

export async function loadUnverifiedInstructors(
  callerRole: string,
  page = 1,
  limit = 50
): Promise<ServiceResult<DiscoveredInstructor[]>> {
  if (callerRole !== 'admin') {
    return { data: null, error: new Error('Unauthorized') };
  }

  if (!hasSupabaseEnv()) {
    return { data: null, error: new Error('Supabase not configured') };
  }
  const client = await getSupabaseClient();
  const from = (page - 1) * limit;
  const { data, error } = await client
    .from('discovered_instructors')
    .select('*')
    .eq('is_verified', false)
    .order('seen_count', { ascending: false })
    .range(from, from + limit - 1);

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  await logAdminAction(callerRole, 'load_unverified_instructors', { page, limit });

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
