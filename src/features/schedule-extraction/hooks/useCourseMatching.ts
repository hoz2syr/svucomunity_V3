'use client';

import { useQuery, queryOptions } from '@tanstack/react-query';
import { useAuth } from '@/src/contexts/AuthContext';
import { COURSE_MATCHING_STALE_TIME_MS } from '@/src/lib/constants';
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
      staleTime: COURSE_MATCHING_STALE_TIME_MS,
    }),
    select: (data) => data,
  });

  const courseCodesFromMatched = matchedCoursesQuery.data
    ?.map((c) => c.code) || [];

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
      staleTime: COURSE_MATCHING_STALE_TIME_MS,
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
