import { hasSupabaseEnv, getSupabaseClient } from '@/src/lib/supabase';
import type { DiscoveredCourse, DiscoveredInstructor, DiscoveredMajor } from '@/src/types/database';
import type { ServiceResult } from './extractionService.supabase';

export async function getPopularCourses(limit = 20): Promise<ServiceResult<DiscoveredCourse[]>> {
  if (!hasSupabaseEnv()) {
    return { data: null, error: new Error('Supabase not configured') };
  }
  const client = await getSupabaseClient();
  const { data, error } = await client
    .from('discovered_courses')
    .select('course_code, major, course_key, course_name, section, semester_code, seen_count, first_seen_at, last_seen_at, is_verified, verified_at, verified_by')
    .order('seen_count', { ascending: false })
    .limit(limit);

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  return { data: data as DiscoveredCourse[], error: null };
}

export async function getPopularInstructors(limit = 20): Promise<ServiceResult<DiscoveredInstructor[]>> {
  if (!hasSupabaseEnv()) {
    return { data: null, error: new Error('Supabase not configured') };
  }
  const client = await getSupabaseClient();
  const { data, error } = await client
    .from('discovered_instructors')
    .select('instructor_username, full_name, seen_count, first_seen_at, last_seen_at, is_verified, verified_at, verified_by')
    .order('seen_count', { ascending: false })
    .limit(limit);

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  return { data: data as DiscoveredInstructor[], error: null };
}

export async function getMajorDistribution(): Promise<ServiceResult<DiscoveredMajor[]>> {
  if (!hasSupabaseEnv()) {
    return { data: null, error: new Error('Supabase not configured') };
  }
  const client = await getSupabaseClient();
  const { data, error } = await client
    .from('discovered_majors')
    .select('major_code, major_name_ar, major_name_en, seen_count, first_seen_at')
    .order('seen_count', { ascending: false });

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  return { data: data as DiscoveredMajor[], error: null };
}
