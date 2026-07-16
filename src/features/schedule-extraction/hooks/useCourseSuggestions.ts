import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/src/contexts/AuthContext';
import { getCourseSuggestions, getAllCourseSuggestions, type CourseSuggestion, type AllSuggestionsResult } from '../services/suggestionService.supabase';

export function useCourseSuggestions(courseCode: string, major: string, courseName: string, section: string | null, instructorName: string | null) {
  const { session } = useAuth();

  return useQuery({
    queryKey: ['course-suggestions', courseCode, major],
    queryFn: async () => {
      const result = await getCourseSuggestions(courseCode, major, courseName, section, instructorName);
      if (result.error) throw result.error;
      return result.data;
    },
    enabled: Boolean(session?.user?.id) && Boolean(courseCode),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAllCourseSuggestions(courses: { courseCode: string; courseName: string; major: string; section: string | null; instructorName: string | null }[]) {
  const { session } = useAuth();

  return useQuery({
    queryKey: ['all-course-suggestions', courses.map(c => c.courseCode).join(',')],
    queryFn: async () => {
      const result = await getAllCourseSuggestions(courses);
      if (result.error) throw result.error;
      return result.data;
    },
    enabled: Boolean(session?.user?.id) && courses.length > 0,
    staleTime: 5 * 60 * 1000,
  });
}

export { type CourseSuggestion, type AllSuggestionsResult };
