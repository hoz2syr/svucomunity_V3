'use client';

import { useQuery, queryOptions } from '@tanstack/react-query';
import { useAuth } from '@/src/contexts/AuthContext';
import {
  matchExtractedCoursesToProgress,
  suggestStudyGroups,
} from '../services/matchingService.supabase';
import type { ServiceResult } from '../services/extractionService.supabase';
import type { MatchedCourseWithStatus, StudyGroupSuggestion } from '../types';

export function useCourseMatching(extractionId: string | null) {
  const { session } = useAuth();
  const userId = session?.user?.id;

  const matchedCoursesQuery = useQuery({
    ...queryOptions({
      queryKey: ['schedule-extraction', 'matched-courses', extractionId, userId],
      queryFn: async (): Promise<MatchedCourseWithStatus[]> => {
        if (!extractionId || !userId) {
          return [];
        }
        const result: ServiceResult<MatchedCourseWithStatus[]> =
          await matchExtractedCoursesToProgress(userId, extractionId);
        if (result.error) throw result.error;
        return result.data || [];
      },
      enabled: !!extractionId && !!userId,
      staleTime: 60 * 1000,
    }),
    select: (data) => data,
  });

  const courseCodesFromMatched = matchedCoursesQuery.data
    ?.filter((c) => c.status !== 'new')
    .map((c) => c.code) || [];

  const studyGroupQuery = useQuery({
    ...queryOptions({
      queryKey: ['schedule-extraction', 'study-group-suggestions', extractionId, userId, courseCodesFromMatched],
      queryFn: async (): Promise<StudyGroupSuggestion[]> => {
        if (!userId || courseCodesFromMatched.length === 0) {
          return [];
        }
        const result: ServiceResult<StudyGroupSuggestion[]> =
          await suggestStudyGroups(userId, courseCodesFromMatched);
        if (result.error) throw result.error;
        return result.data || [];
      },
      enabled: !!userId && courseCodesFromMatched.length > 0,
      staleTime: 60 * 1000,
    }),
    select: (data) => data,
  });

  const isMatching =
    matchedCoursesQuery.isFetching || studyGroupQuery.isFetching;

  return {
    matchedCourses: matchedCoursesQuery.data || [],
    studyGroupSuggestions: studyGroupQuery.data || [],
    isMatching,
    refetch: () => {
      matchedCoursesQuery.refetch();
      studyGroupQuery.refetch();
    },
    matchedCoursesError: matchedCoursesQuery.error,
    studyGroupSuggestionsError: studyGroupQuery.error,
  };
}
