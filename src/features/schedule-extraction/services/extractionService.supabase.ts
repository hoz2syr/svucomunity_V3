import { hasSupabaseEnv, getSupabaseClient } from '@/src/lib/supabase';
import { TableSchema } from '../utils/schemaDetection';
import { normalizeSemesterCode } from '../utils/semesterUtils';
import type { ExtractedCourse } from '../types';
import type { Json, RawExtraction, DiscoveredCourse, DiscoveredInstructor, DiscoveredMajor, StudentSemesterCourse } from '@/src/types/database';

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

export async function saveStudentSemesterCourses(
  userId: string,
  courses: ExtractedCourse[]
): Promise<ServiceResult<StudentSemesterCourse[]>> {
  if (!hasSupabaseEnv()) {
    return { data: null, error: new Error('Supabase not configured') };
  }
  const client = await getSupabaseClient();
  if (!courses.length) {
    return { data: [], error: null };
  }

  const normalizedSemester = normalizeSemesterCode(courses[0].semester || '');
  const semesterYear = normalizedSemester.slice(-2);

  const { data: semester, error: semesterError } = await client
    .from('student_semesters')
    .upsert(
      {
        user_id: userId,
        semester_code: normalizedSemester,
        semester_year: semesterYear,
      },
      { onConflict: 'user_id,semester_code' }
    )
    .select('id')
    .single();

  if (semesterError || !semester) {
    return { data: null, error: new Error(semesterError?.message ?? 'Failed to save semester') };
  }

  const semesterId = semester.id as string;

  await client
    .from('student_semester_courses')
    .delete()
    .eq('semester_id', semesterId);

  const rows = courses.map(course => ({
    semester_id: semesterId,
    course_name: course.name,
    full_code: course.code,
    instructor_name: course.instructor,
    instructor_username: course.instructor_username,
    major: course.major || '',
    course_key: course.course_key || course.code,
    section: course.section,
  }));

  const { data, error } = await client
    .from('student_semester_courses')
    .insert(rows)
    .select('id, semester_id, course_name, full_code, instructor_name, instructor_username, major, course_key, section, created_at');

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  const courseCount = data?.length ?? 0;
  await client
    .from('student_semesters')
    .update({ course_count: courseCount })
    .eq('id', semesterId);

  return { data: (data as StudentSemesterCourse[]) ?? null, error: null };
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
          first_seen_at: new Date().toISOString(),
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
          first_seen_at: new Date().toISOString(),
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
          first_seen_at: new Date().toISOString(),
          last_seen_at: new Date().toISOString(),
        },
        {
          onConflict: 'major_code',
          count: 'exact',
        }
      )
      .select('major_code, major_name_ar, major_name_en, seen_count, first_seen_at, last_seen_at')
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
): Promise<ServiceResult<StudentSemesterCourse[]>> {
  if (!hasSupabaseEnv()) {
    return { data: null, error: new Error('Supabase not configured') };
  }
  const client = await getSupabaseClient();
  const normalizedSemester = normalizeSemesterCode(semesterCode);

  const { data: semester, error: semesterError } = await client
    .from('student_semesters')
    .select('id')
    .eq('user_id', userId)
    .eq('semester_code', normalizedSemester)
    .single();

  if (semesterError || !semester) {
    return { data: [], error: null };
  }

  const { data, error } = await client
    .from('student_semester_courses')
    .select('id, semester_id, course_name, full_code, instructor_name, instructor_username, major, course_key, section, created_at')
    .eq('semester_id', semester.id)
    .order('created_at', { ascending: false });

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  return { data: (data as StudentSemesterCourse[]) ?? [], error: null };
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
