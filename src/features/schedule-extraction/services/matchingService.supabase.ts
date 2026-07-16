import { hasSupabaseEnv, getSupabaseClient } from '@/src/lib/supabase';
import type { ServiceResult } from './extractionService.supabase';
import type { ExtractedCourseRecord, UserCourseProgress } from '@/src/types/database';
import type { MatchedGroup, StudyGroupSuggestion, MatchedCourseWithStatus, CourseStatus } from '../types';

export async function matchExtractedCoursesToProgress(
  userId: string,
  extractionId: string
): Promise<ServiceResult<MatchedCourseWithStatus[]>> {
  if (!hasSupabaseEnv()) {
    return { data: null, error: new Error('Supabase not configured') };
  }
  const client = await getSupabaseClient();

  const { data: courses, error: coursesError } = await client
    .from('extracted_courses')
    .select('*')
    .eq('extraction_id', extractionId);

  if (coursesError) {
    return { data: null, error: new Error(coursesError.message) };
  }

  const extractedCourses = (courses || []) as ExtractedCourseRecord[];
  if (extractedCourses.length === 0) {
    return { data: [], error: null };
  }

  const courseCodes = extractedCourses.map(c => c.full_code);

  const { data: progress, error: progressError } = await client
    .from('user_course_progress')
    .select('*')
    .eq('user_id', userId)
    .in('course_code', courseCodes);

  if (progressError) {
    return { data: null, error: new Error(progressError.message) };
  }

  const progressMap = new Map<string, UserCourseProgress>();
  for (const p of (progress || []) as UserCourseProgress[]) {
    progressMap.set(p.course_code.toUpperCase(), p);
  }

  const matchedCourses: MatchedCourseWithStatus[] = extractedCourses.map(course => {
    const upperCode = course.full_code.toUpperCase();
    const userProgress = progressMap.get(upperCode);

    let status: CourseStatus = 'new';
    if (userProgress) {
      status = userProgress.status as CourseStatus;
    }

    return {
      code: course.full_code,
      name: course.course_name,
      section: course.section,
      major: course.major,
      status,
      matchedGroups: [],
    };
  });

  return { data: matchedCourses, error: null };
}

export async function suggestStudyGroups(
  userId: string,
  courseCodes: string[]
): Promise<ServiceResult<StudyGroupSuggestion[]>> {
  if (!hasSupabaseEnv()) {
    return { data: null, error: new Error('Supabase not configured') };
  }
  const client = await getSupabaseClient();

  if (courseCodes.length === 0) {
    return { data: [], error: null };
  }

  const { data: groups, error: groupsError } = await client
    .from('groups')
    .select('*')
    .in('course_code', courseCodes)
    .order('current_members', { ascending: false });

  if (groupsError) {
    return { data: null, error: new Error(groupsError.message) };
  }

  const matchedGroups: MatchedGroup[] = (groups || []).map(g => ({
    id: g.id,
    name: g.name,
    course_code: g.course_code,
    course_name: g.course_name,
    major: g.major,
    class_number: g.class_number ?? null,
    current_members: g.current_members,
    max_members: g.max_members,
    is_full: g.current_members >= g.max_members,
    creator_name: g.creator_name,
    creator_id: g.creator_id,
    whatsapp_link: g.whatsapp_link ?? null,
    group_link: g.group_link ?? null,
  }));

  const suggestions = matchedGroups
    .map(group => calculateRelevance(group, courseCodes))
    .filter((s): s is StudyGroupSuggestion => s !== null)
    .sort((a, b) => b.relevanceScore - a.relevanceScore);

  return { data: suggestions, error: null };
}

export function calculateRelevance(
  group: MatchedGroup,
  courseCodes: string[]
): StudyGroupSuggestion | null {
  const upperGroupCode = group.course_code.toUpperCase();
  const matchedCourseCodes = courseCodes.filter(
    c => c.toUpperCase() === upperGroupCode
  );

  if (matchedCourseCodes.length === 0) {
    return null;
  }

  const reasons: string[] = [];
  let relevanceScore = 0;

  relevanceScore += matchedCourseCodes.length * 40;

  if (!group.is_full) {
    relevanceScore += 20;
    reasons.push('متاحة للمشاركة');
  }

  if (group.group_link) {
    relevanceScore += 10;
    reasons.push('رابط المجموعة متاح');
  }

  if (group.whatsapp_link) {
    relevanceScore += 10;
    reasons.push('مجموعة واتساب متاحة');
  }

  if (group.matchScore && group.matchScore >= 80) {
    relevanceScore += 15;
    reasons.push('تطابق عالي');
  }

  if (group.current_members > 0) {
    relevanceScore += 5;
    reasons.push('أعضاء نشطون');
  }

  return {
    group,
    relevanceScore: Math.min(100, relevanceScore),
    matchedCourseCodes,
    reasons,
  };
}
