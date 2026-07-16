import { hasSupabaseEnv } from '@/src/lib/env';
import { fetchPublishedTests } from '@/src/features/exam/src/services/tests.service';
import { getAllWithCreators } from '@/src/features/study-groups/services/studyGroup.supabase';
import { getReferencesByCourseCode } from '@/src/features/subjects/src/services/subjects.supabase';

export type ServiceResult<T> = { data: T | null; error: Error | null };

export interface CourseSuggestion {
  courseCode: string;
  courseName: string;
  major: string;
  section: string | null;
  instructorName: string | null;
  tests: {
    id: string;
    title: string;
    description?: string;
    rating?: number;
    publishedAt?: string;
  }[];
  studyGroups: {
    id: string;
    name: string;
    course_name: string;
    class_number?: string;
    doctor_name?: string;
    current_members: number;
    max_members: number;
    whatsapp_link: string;
    group_link?: string;
    creator_name: string;
    _creatorFullName?: string;
  }[];
  materials: {
    id: string;
    title: string;
    type: string;
    url?: string;
    created_at: string;
  }[];
}

export interface AllSuggestionsResult {
  suggestions: CourseSuggestion[];
  totalTests: number;
  totalGroups: number;
  totalMaterials: number;
}

export async function getCourseSuggestions(
  courseCode: string,
  major: string,
  courseName: string,
  section: string | null,
  instructorName: string | null,
): Promise<ServiceResult<CourseSuggestion>> {
  if (!hasSupabaseEnv()) {
    return { data: null, error: new Error('Supabase environment not configured') };
  }

  try {
    const [testsResult, groupsResult, materialsResult] = await Promise.all([
      fetchPublishedTests(5, undefined, major, courseCode),
      getAllWithCreators(),
      getReferencesByCourseCode(courseCode),
    ]);

    const tests = testsResult.data?.map(t => ({
      id: t.id,
      title: t.title,
      description: t.description,
      rating: t.rating,
      publishedAt: t.publishedAt,
    })) ?? [];

    const matchingGroups = (groupsResult.data ?? []).filter(
      g => g.course_code === courseCode || g.course_name === courseName || (major && g.major === major),
    );

    const studyGroups = matchingGroups.slice(0, 5).map(g => ({
      id: g.id,
      name: g.name,
      course_name: g.course_name,
      class_number: g.class_number,
      doctor_name: g.doctor_name,
      current_members: g.current_members,
      max_members: g.max_members,
      whatsapp_link: g.whatsapp_link,
      group_link: g.group_link,
      creator_name: g.creator_name,
      _creatorFullName: g._creatorFullName,
    }));

    const materials = (materialsResult.data ?? []).map(m => ({
      id: m.id,
      title: m.title,
      type: m.type,
      url: m.url,
      created_at: m.created_at,
    }));

    return {
      data: {
        courseCode,
        courseName,
        major,
        section,
        instructorName,
        tests,
        studyGroups,
        materials,
      },
      error: null,
    };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error('Failed to fetch suggestions') };
  }
}

export async function getAllCourseSuggestions(
  courses: { courseCode: string; courseName: string; major: string; section: string | null; instructorName: string | null }[],
): Promise<ServiceResult<AllSuggestionsResult>> {
  if (!hasSupabaseEnv()) {
    return { data: null, error: new Error('Supabase environment not configured') };
  }

  try {
    const suggestions: CourseSuggestion[] = [];
    let totalTests = 0;
    let totalGroups = 0;
    let totalMaterials = 0;

    for (const course of courses) {
      const result = await getCourseSuggestions(
        course.courseCode,
        course.major,
        course.courseName,
        course.section,
        course.instructorName,
      );

      if (result.error) {
        console.error(`Failed to fetch suggestions for ${course.courseCode}:`, result.error);
        continue;
      }

      if (result.data) {
        suggestions.push(result.data);
        totalTests += result.data.tests.length;
        totalGroups += result.data.studyGroups.length;
        totalMaterials += result.data.materials.length;
      }
    }

    return {
      data: { suggestions, totalTests, totalGroups, totalMaterials },
      error: null,
    };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error('Failed to fetch all suggestions') };
  }
}
