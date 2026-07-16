'use client';
import { useQuery, queryOptions } from '@tanstack/react-query';
import { loadDiscoveredCourses, type ServiceResult } from '../services/extractionService.supabase';
import type { DiscoveredCourse } from '@/src/types/database';

export const discoveredCoursesQueryOptions = (major?: string) =>
  queryOptions({
    queryKey: ['schedule-extraction', 'discovered-courses', major],
    queryFn: async () => {
      const result: ServiceResult<DiscoveredCourse[]> = await loadDiscoveredCourses(major);
      if (result.error) throw result.error;
      return result.data as DiscoveredCourse[];
    },
  });

export function useDiscoveredCourses(major?: string) {
  return useQuery(discoveredCoursesQueryOptions(major));
}
