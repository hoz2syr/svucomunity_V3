'use client';
import { useQuery, queryOptions } from '@tanstack/react-query';
import { getPopularCourses, getPopularInstructors, getMajorDistribution } from '../services/analyticsService.supabase';
import type { ServiceResult } from '../services/extractionService.supabase';
import type { DiscoveredCourse, DiscoveredInstructor, DiscoveredMajor } from '@/src/types/database';

export const popularCoursesQueryOptions = (limit = 20) =>
  queryOptions({
    queryKey: ['analytics', 'popular-courses', limit],
    queryFn: async () => {
      const result: ServiceResult<DiscoveredCourse[]> = await getPopularCourses(limit);
      if (result.error) throw result.error;
      return result.data as DiscoveredCourse[];
    },
  });

export const popularInstructorsQueryOptions = (limit = 20) =>
  queryOptions({
    queryKey: ['analytics', 'popular-instructors', limit],
    queryFn: async () => {
      const result: ServiceResult<DiscoveredInstructor[]> = await getPopularInstructors(limit);
      if (result.error) throw result.error;
      return result.data as DiscoveredInstructor[];
    },
  });

export const majorDistributionQueryOptions = () =>
  queryOptions({
    queryKey: ['analytics', 'major-distribution'],
    queryFn: async () => {
      const result: ServiceResult<DiscoveredMajor[]> = await getMajorDistribution();
      if (result.error) throw result.error;
      return result.data as DiscoveredMajor[];
    },
  });

export function usePopularCourses(limit = 20) {
  return useQuery(popularCoursesQueryOptions(limit));
}

export function usePopularInstructors(limit = 20) {
  return useQuery(popularInstructorsQueryOptions(limit));
}

export function useMajorDistribution() {
  return useQuery(majorDistributionQueryOptions());
}
