'use client';
import { useQuery, queryOptions } from '@tanstack/react-query';
import { useAuth } from '@/src/contexts/AuthContext';
import {
  loadCurrentSemesterCourses,
  type ServiceResult,
} from '../services/extractionService.supabase';
import { getCurrentSemesterCode } from '../utils/semesterUtils';
import type { ExtractedCourseRecord } from '@/src/types/database';

export const currentSemesterCoursesQueryOptions = (
  userId: string,
  semesterCode?: string
) =>
  queryOptions({
    queryKey: ['schedule-extraction', 'current-semester', userId, semesterCode],
    queryFn: async () => {
      const result: ServiceResult<ExtractedCourseRecord[]> = await loadCurrentSemesterCourses(
        userId,
        semesterCode!
      );
      if (result.error) throw result.error;
      return result.data as ExtractedCourseRecord[];
    },
  });

export function useCurrentSemesterCourses(semesterCode?: string) {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const resolvedSemesterCode = semesterCode ?? getCurrentSemesterCode();

  return useQuery({
    ...currentSemesterCoursesQueryOptions(userId!, resolvedSemesterCode),
    enabled: !!userId,
  });
}
