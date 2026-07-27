import { hasSupabaseEnv, getSupabaseClient } from '@/src/lib/supabase';
import type { DiscoveredCourse, DiscoveredInstructor } from '@/src/types/database';
import type { ServiceResult, PaginatedServiceResult } from '@/src/types/admin';
import { ROLES } from '@/src/types/admin';
import { logAdminAction } from './adminAudit';

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
  if (callerRole !== ROLES.ADMIN) {
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
  if (callerRole !== ROLES.ADMIN) {
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
  callerId: string,
  callerRole: string,
  page = 1,
  limit = 50
): Promise<PaginatedServiceResult<DiscoveredCourse>> {
  if (callerRole !== ROLES.ADMIN) {
    return { data: null, totalCount: 0, error: new Error('Unauthorized') };
  }

  if (!hasSupabaseEnv()) {
    return { data: null, totalCount: 0, error: new Error('Supabase not configured') };
  }
  const client = await getSupabaseClient();
  const from = (page - 1) * limit;
  const { data, error } = await client
    .from('discovered_courses')
    .select('course_code, major, course_key, course_name, section, semester_code, seen_count, first_seen_at, last_seen_at, is_verified, verified_at, verified_by')
    .eq('is_verified', false)
    .order('seen_count', { ascending: false })
    .range(from, from + limit - 1);

  if (error) {
    return { data: null, totalCount: 0, error: new Error(error.message) };
  }

  const { count, error: countError } = await client
    .from('discovered_courses')
    .select('course_code', { count: 'exact', head: true })
    .eq('is_verified', false);

  if (countError) {
    return { data: null, totalCount: 0, error: new Error(countError.message) };
  }

  await logAdminAction(callerId, 'load_unverified_courses', { page, limit });

  return { data: data as DiscoveredCourse[], totalCount: count || 0, error: null };
}

export async function loadUnverifiedInstructors(
  callerId: string,
  callerRole: string,
  page = 1,
  limit = 50
): Promise<PaginatedServiceResult<DiscoveredInstructor>> {
  if (callerRole !== ROLES.ADMIN) {
    return { data: null, totalCount: 0, error: new Error('Unauthorized') };
  }

  if (!hasSupabaseEnv()) {
    return { data: null, totalCount: 0, error: new Error('Supabase not configured') };
  }
  const client = await getSupabaseClient();
  const from = (page - 1) * limit;
  const { data, error } = await client
    .from('discovered_instructors')
    .select('instructor_username, full_name, seen_count, first_seen_at, last_seen_at, is_verified, verified_at, verified_by')
    .eq('is_verified', false)
    .order('seen_count', { ascending: false })
    .range(from, from + limit - 1);

  if (error) {
    return { data: null, totalCount: 0, error: new Error(error.message) };
  }

  const { count, error: countError } = await client
    .from('discovered_instructors')
    .select('instructor_username', { count: 'exact', head: true })
    .eq('is_verified', false);

  if (countError) {
    return { data: null, totalCount: 0, error: new Error(countError.message) };
  }

  await logAdminAction(callerId, 'load_unverified_instructors', { page, limit });

  return { data: data as DiscoveredInstructor[], totalCount: count || 0, error: null };
}
