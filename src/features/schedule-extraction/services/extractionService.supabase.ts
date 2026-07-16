import { hasSupabaseEnv, getSupabaseClient } from '@/src/lib/supabase';
import { TableSchema } from '../utils/schemaDetection';
import type { ExtractedCourse } from '../types';
import type { Json, RawExtraction, ExtractedCourseRecord, DiscoveredCourse, DiscoveredInstructor, DiscoveredMajor } from '@/src/types/database';

export type ServiceResult<T> = { data: T | null; error: Error | null };

export async function saveRawExtraction(
  userId: string,
  rawMarkdown: string,
  schema: TableSchema
): Promise<ServiceResult<RawExtraction>> {
  if (!hasSupabaseEnv()) {
    return { data: null, error: new Error('Supabase not configured') };
  }
  const client = await getSupabaseClient();
  const { data, error } = await client
    .from('raw_extractions')
    .insert({
      user_id: userId,
      raw_markdown: rawMarkdown,
      detected_schema: schema as unknown as Json,
    })
    .select('id, user_id, raw_markdown, detected_schema, created_at')
    .single();

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  return { data: data as RawExtraction, error: null };
}

export async function saveExtractedCourses(
  extractionId: string,
  courses: ExtractedCourse[]
): Promise<ServiceResult<ExtractedCourseRecord[]>> {
  if (!hasSupabaseEnv()) {
    return { data: null, error: new Error('Supabase not configured') };
  }
  const client = await getSupabaseClient();
  const rows = courses.map(course => ({
    extraction_id: extractionId,
    course_name: course.name,
    semester_code: course.semester || '',
    full_code: course.code,
    instructor_name: course.instructor,
    instructor_username: course.instructor_username,
    major: course.major || '',
    course_key: course.course_key || '',
    section: course.section,
    semester_year: course.semester || '',
    discovered_course_code: course.code,
    discovered_instructor_username: course.instructor_username || undefined,
  }));

  const { data, error } = await client
    .from('extracted_courses')
    .insert(rows)
    .select('id, extraction_id, course_name, semester_code, full_code, instructor_name, instructor_username, major, course_key, section, semester_year, discovered_course_code, discovered_instructor_username, created_at');

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  return { data: data as ExtractedCourseRecord[], error: null };
}

export async function upsertDiscoveredCourses(
  courses: ExtractedCourse[]
): Promise<ServiceResult<DiscoveredCourse[]>> {
  if (!hasSupabaseEnv()) {
    return { data: null, error: new Error('Supabase not configured') };
  }
  const client = await getSupabaseClient();
  const results: DiscoveredCourse[] = [];

  for (const course of courses) {
    if (!course.code) continue;

    const { data, error } = await client
      .from('discovered_courses')
      .upsert(
        {
          course_code: course.code,
          major: course.major || '',
          course_key: course.course_key || '',
          course_name: course.name,
          section: course.section,
          semester_code: course.semester || '',
          last_seen_at: new Date().toISOString(),
        },
        {
          onConflict: 'course_code',
          count: 'exact',
        }
      )
      .select('course_code, major, course_key, course_name, section, semester_code, seen_count, first_seen_at, last_seen_at, is_verified, verified_at, verified_by')
      .single();

    if (error) {
      console.error(`Failed to upsert course ${course.code}:`, error);
      continue;
    }

    if (data) {
      results.push(data as DiscoveredCourse);
    }
  }

  return { data: results, error: null };
}

export async function upsertDiscoveredInstructors(
  courses: ExtractedCourse[]
): Promise<ServiceResult<DiscoveredInstructor[]>> {
  if (!hasSupabaseEnv()) {
    return { data: null, error: new Error('Supabase not configured') };
  }
  const client = await getSupabaseClient();
  const seenUsernames = new Set<string>();
  const results: DiscoveredInstructor[] = [];

  for (const course of courses) {
    if (!course.instructor_username || seenUsernames.has(course.instructor_username)) {
      continue;
    }
    seenUsernames.add(course.instructor_username);

    const { data, error } = await client
      .from('discovered_instructors')
      .upsert(
        {
          instructor_username: course.instructor_username,
          full_name: course.instructor || course.instructor_username,
          last_seen_at: new Date().toISOString(),
        },
        {
          onConflict: 'instructor_username',
          count: 'exact',
        }
      )
      .select('instructor_username, full_name, seen_count, first_seen_at, last_seen_at, is_verified, verified_at, verified_by')
      .single();

    if (error) {
      console.error(`Failed to upsert instructor ${course.instructor_username}:`, error);
      continue;
    }

    if (data) {
      results.push(data as DiscoveredInstructor);
    }
  }

  return { data: results, error: null };
}

export async function upsertDiscoveredMajors(
  majors: string[]
): Promise<ServiceResult<DiscoveredMajor[]>> {
  if (!hasSupabaseEnv()) {
    return { data: null, error: new Error('Supabase not configured') };
  }
  const client = await getSupabaseClient();
  const results: DiscoveredMajor[] = [];

  for (const major of majors) {
    const { data, error } = await client
      .from('discovered_majors')
      .upsert(
        {
          major_code: major,
          last_seen_at: new Date().toISOString(),
        },
        {
          onConflict: 'major_code',
          count: 'exact',
        }
      )
      .select('major_code, major_name_ar, major_name_en, seen_count, first_seen_at')
      .single();

    if (error) {
      console.error(`Failed to upsert major ${major}:`, error);
      continue;
    }

    if (data) {
      results.push(data as DiscoveredMajor);
    }
  }

  return { data: results, error: null };
}

export async function loadCurrentSemesterCourses(
  userId: string,
  semesterCode: string
): Promise<ServiceResult<ExtractedCourseRecord[]>> {
  if (!hasSupabaseEnv()) {
    return { data: null, error: new Error('Supabase not configured') };
  }
  const client = await getSupabaseClient();
  const { data, error } = await client
    .from('extracted_courses')
    .select(`
      id,
      extraction_id,
      course_name,
      semester_code,
      full_code,
      instructor_name,
      instructor_username,
      major,
      course_key,
      section,
      semester_year,
      discovered_course_code,
      discovered_instructor_username,
      created_at,
      raw_extractions!inner(user_id)
    `)
    .eq('raw_extractions.user_id', userId)
    .eq('semester_code', semesterCode)
    .order('created_at', { ascending: false });

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  return { data: data as ExtractedCourseRecord[], error: null };
}

export async function loadDiscoveredCourses(
  major?: string
): Promise<ServiceResult<DiscoveredCourse[]>> {
  if (!hasSupabaseEnv()) {
    return { data: null, error: new Error('Supabase not configured') };
  }
  const client = await getSupabaseClient();
  let query = client
    .from('discovered_courses')
    .select('course_code, major, course_key, course_name, section, semester_code, seen_count, first_seen_at, last_seen_at, is_verified, verified_at, verified_by')
    .order('seen_count', { ascending: false });

  if (major) {
    query = query.eq('major', major);
  }

  const { data, error } = await query;

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  return { data: data as DiscoveredCourse[], error: null };
}

export async function loadDiscoveredInstructors(): Promise<ServiceResult<DiscoveredInstructor[]>> {
  if (!hasSupabaseEnv()) {
    return { data: null, error: new Error('Supabase not configured') };
  }
  const client = await getSupabaseClient();
  const { data, error } = await client
    .from('discovered_instructors')
    .select('instructor_username, full_name, seen_count, first_seen_at, last_seen_at, is_verified, verified_at, verified_by')
    .order('seen_count', { ascending: false });

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  return { data: data as DiscoveredInstructor[], error: null };
}

export async function loadDiscoveredMajors(): Promise<ServiceResult<DiscoveredMajor[]>> {
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
