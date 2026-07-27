'use client';

import { useQuery, queryOptions } from '@tanstack/react-query';
import { COURSE_MATCHING_STALE_TIME_MS } from '@/src/lib/constants';
import {
  matchExtractedCoursesToProgress,
  suggestStudyGroups,
} from '../services/matchingService.supabase';
import type { ServiceResult } from '../services/extractionService.supabase';
import type { MatchedCourseWithStatus, StudyGroupSuggestion } from '../types';

export function useCourseMatching(userId: string | null, semesterCode: string | null) {
  const matchedCoursesQuery = useQuery({
    ...queryOptions({
      queryKey: ['schedule-extraction', 'matched-courses', userId, semesterCode],
      queryFn: async (): Promise<MatchedCourseWithStatus[]> => {
        if (!userId || !semesterCode) {
          return [];
        }
        const result: ServiceResult<MatchedCourseWithStatus[]> =
          await matchExtractedCoursesToProgress(userId, semesterCode);
        if (result.error) throw result.error;
        return result.data || [];
      },
      enabled: !!userId && !!semesterCode,
      staleTime: COURSE_MATCHING_STALE_TIME_MS,
    }),
    select: (data) => data,
  });

  const courseCodesFromMatched = matchedCoursesQuery.data
    ?.map((c) => c.code) || [];

  const studyGroupQuery = useQuery({
    ...queryOptions({
      queryKey: ['schedule-extraction', 'study-group-suggestions', userId, semesterCode, courseCodesFromMatched],
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
