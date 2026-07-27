import { hasSupabaseEnv, getSupabaseClient } from '@/src/lib/supabase';
import type { RawExtraction, Profile } from '@/src/types/database';
import type { ServiceResult } from '@/src/types/admin';

export type AdminExtraction = RawExtraction & {
  user?: Profile;
  course_count?: number;
};

export async function listAllExtractions(
  callerRole: string,
  page = 1,
  limit = 50
): Promise<ServiceResult<AdminExtraction[]>> {
  if (callerRole !== 'admin') {
    return { data: null, error: new Error('Unauthorized') };
  }

  if (!hasSupabaseEnv()) {
    return { data: null, error: new Error('Supabase not configured') };
  }
  const client = await getSupabaseClient();

  const from = (page - 1) * limit;
  const { data, error } = await client
    .from('raw_extractions')
    .select('id, user_id, raw_markdown, detected_schema, created_at')
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1);

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  const extractions = (data as RawExtraction[]).map((e) => ({
    ...e,
    course_count: 0,
  })) as AdminExtraction[];

  if (extractions.length > 0) {
    const userIds = Array.from(new Set(extractions.map((e) => e.user_id)));
    if (userIds.length > 0) {
      const { data: semesters, error: semestersError } = await client
        .from('student_semesters')
        .select('user_id, course_count')
        .in('user_id', userIds);

      if (!semestersError && semesters) {
        const userCourseCount = new Map<string, number>();
        for (const s of semesters as { user_id: string; course_count: number }[]) {
          userCourseCount.set(s.user_id, (userCourseCount.get(s.user_id) || 0) + (s.course_count || 0));
        }
        for (const extraction of extractions) {
          extraction.course_count = userCourseCount.get(extraction.user_id) || 0;
        }
      }
    }
  }

  const profileUserIds = Array.from(new Set(extractions.map((e) => e.user_id)));
  if (profileUserIds.length > 0) {
    const { data: profiles, error: profilesError } = await client
      .from('profiles')
      .select('id, full_name, email, username, role')
      .in('id', profileUserIds);

    if (!profilesError && profiles) {
      const profileMap = new Map(profiles.map((p) => [p.id, p]));
      for (const extraction of extractions) {
        (extraction as AdminExtraction).user = profileMap.get(extraction.user_id) as Profile;
      }
    }
  }

  await logAdminAction(callerRole, 'list_all_extractions', { page, limit });

  return { data: extractions as AdminExtraction[], error: null };
}

export async function getExtractionDetails(
  extractionId: string,
  callerRole: string
): Promise<ServiceResult<{ extraction: RawExtraction; courses: { course_name: string; semester_code: string; full_code: string; instructor_name: string | null; major: string }[]; user?: Profile }>> {
  if (callerRole !== 'admin') {
    return { data: null, error: new Error('Unauthorized') };
  }

  if (!hasSupabaseEnv()) {
    return { data: null, error: new Error('Supabase not configured') };
  }
  const client = await getSupabaseClient();

  const { data: extraction, error: extractionError } = await client
    .from('raw_extractions')
    .select('id, user_id, raw_markdown, detected_schema, created_at')
    .eq('id', extractionId)
    .single();

  if (extractionError) {
    return { data: null, error: new Error(extractionError.message) };
  }

  const { data: semesters, error: semestersError } = await client
    .from('student_semesters')
    .select('id, semester_code')
    .eq('user_id', extraction.user_id);

  if (semestersError) {
    return { data: null, error: new Error(semestersError.message) };
  }

  let courses: { course_name: string; semester_code: string; full_code: string; instructor_name: string | null; major: string }[] = [];
  if (semesters && semesters.length > 0) {
    const semesterIds = semesters.map(s => s.id);
    const { data: semesterCourses, error: coursesError } = await client
      .from('student_semester_courses')
      .select('course_name, semester_id, full_code, instructor_name, major')
      .in('semester_id', semesterIds);

    if (coursesError) {
      return { data: null, error: new Error(coursesError.message) };
    }

    const semesterCodeMap = new Map(semesters.map(s => [s.id, s.semester_code]));
    courses = (semesterCourses || []).map(c => ({
      course_name: c.course_name,
      semester_code: semesterCodeMap.get(c.semester_id) || '',
      full_code: c.full_code,
      instructor_name: c.instructor_name,
      major: c.major,
    }));
  }

  let user: Profile | undefined;
  const { data: profile, error: profileError } = await client
    .from('profiles')
    .select('id, full_name, email, username, role')
    .eq('id', extraction.user_id)
    .single();

  if (!profileError && profile) {
    user = profile as Profile;
  }

  await logAdminAction(callerRole, 'get_extraction_details', { extractionId });

  return {
    data: {
      extraction: extraction as RawExtraction,
      courses,
      user,
    },
    error: null,
  };
}

type PlatformStats = {
  total_users: number;
  total_extractions: number;
  total_courses: number;
  total_instructors: number;
  total_majors: number;
  total_tests: number;
  total_groups: number;
  verified_courses: number;
  unverified_courses: number;
  verified_instructors: number;
  unverified_instructors: number;
};

export async function getPlatformStats(
  callerRole: string
): Promise<ServiceResult<PlatformStats>> {
  if (callerRole !== 'admin') {
    return { data: null, error: new Error('Unauthorized') };
  }

  if (!hasSupabaseEnv()) {
    return { data: null, error: new Error('Supabase not configured') };
  }
  const client = await getSupabaseClient();

  const [
    usersResult,
    extractionsResult,
    coursesResult,
    instructorsResult,
    majorsResult,
    testsResult,
    groupsResult,
    verifiedCoursesResult,
    unverifiedCoursesResult,
    verifiedInstructorsResult,
    unverifiedInstructorsResult,
  ] = await Promise.all([
    client.from('profiles').select('id', { count: 'exact', head: true }),
    client.from('raw_extractions').select('id', { count: 'exact', head: true }),
    client.from('student_semester_courses').select('id', { count: 'exact', head: true }),
    client.from('discovered_instructors').select('id', { count: 'exact', head: true }),
    client.from('discovered_majors').select('id', { count: 'exact', head: true }),
    client.from('tests').select('id', { count: 'exact', head: true }),
    client.from('groups').select('id', { count: 'exact', head: true }),
    client.from('discovered_courses').select('id', { count: 'exact', head: true }).eq('is_verified', true),
    client.from('discovered_courses').select('id', { count: 'exact', head: true }).eq('is_verified', false),
    client.from('discovered_instructors').select('id', { count: 'exact', head: true }).eq('is_verified', true),
    client.from('discovered_instructors').select('id', { count: 'exact', head: true }).eq('is_verified', false),
  ]);

  const errors = [
    usersResult.error,
    extractionsResult.error,
    coursesResult.error,
    instructorsResult.error,
    majorsResult.error,
    testsResult.error,
    groupsResult.error,
    verifiedCoursesResult.error,
    unverifiedCoursesResult.error,
    verifiedInstructorsResult.error,
    unverifiedInstructorsResult.error,
  ].filter(Boolean);

  if (errors.length > 0) {
    return { data: null, error: new Error(errors[0]!.message) };
  }

  const count = (result: { count: number | null }) => result.count || 0;

  await logAdminAction(callerRole, 'get_platform_stats', {});

  return {
    data: {
      total_users: count(usersResult),
      total_extractions: count(extractionsResult),
      total_courses: count(coursesResult),
      total_instructors: count(instructorsResult),
      total_majors: count(majorsResult),
      total_tests: count(testsResult),
      total_groups: count(groupsResult),
      verified_courses: count(verifiedCoursesResult),
      unverified_courses: count(unverifiedCoursesResult),
      verified_instructors: count(verifiedInstructorsResult),
      unverified_instructors: count(unverifiedInstructorsResult),
    },
    error: null,
  };
}

export async function logAdminAction(
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

  try {
    await client.from('admin_audit_log').insert({
      caller_id: callerId,
      action,
      payload,
      ip_address: ipAddress,
      user_agent: userAgent,
    });
  } catch {
    // audit log failure must not break the original operation
  }
}
