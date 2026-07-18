'use client';
import { useQuery, queryOptions } from '@tanstack/react-query';
import { useAuth } from '@/src/contexts/AuthContext';
import { ANALYTICS_STALE_TIME_MS } from '@/src/lib/constants';
import { getPopularCourses, getPopularInstructors, getMajorDistribution } from '../services/analyticsService.supabase';
import type { ServiceResult } from '../services/extractionService.supabase';
import type { DiscoveredCourse, DiscoveredInstructor, DiscoveredMajor } from '@/src/types/database';

export const popularCoursesQueryOptions = (limit = 20) =>
  queryOptions({
    queryKey: ['analytics', 'popular-courses', limit],
    queryFn: async () => {
      const result: ServiceResult<DiscoveredCourse[]> = await getPopularCourses('', limit);
      if (result.error) throw result.error;
      return result.data as DiscoveredCourse[];
    },
  });

export const popularInstructorsQueryOptions = (limit = 20) =>
  queryOptions({
    queryKey: ['analytics', 'popular-instructors', limit],
    queryFn: async () => {
      const result: ServiceResult<DiscoveredInstructor[]> = await getPopularInstructors('', limit);
      if (result.error) throw result.error;
      return result.data as DiscoveredInstructor[];
    },
  });

export const majorDistributionQueryOptions = () =>
  queryOptions({
    queryKey: ['analytics', 'major-distribution'],
    queryFn: async () => {
      const result: ServiceResult<DiscoveredMajor[]> = await getMajorDistribution('');
      if (result.error) throw result.error;
      return result.data as DiscoveredMajor[];
    },
  });

export function usePopularCourses(limit = 20) {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const callerRole = profile?.role || '';

  return useQuery({
    ...popularCoursesQueryOptions(limit),
    enabled: isAdmin,
    staleTime: ANALYTICS_STALE_TIME_MS,
    queryFn: async () => {
      const result: ServiceResult<DiscoveredCourse[]> = await getPopularCourses(callerRole, limit);
      if (result.error) throw result.error;
      return result.data as DiscoveredCourse[];
    },
  });
}

export function usePopularInstructors(limit = 20) {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const callerRole = profile?.role || '';

  return useQuery({
    ...popularInstructorsQueryOptions(limit),
    enabled: isAdmin,
    staleTime: ANALYTICS_STALE_TIME_MS,
    queryFn: async () => {
      const result: ServiceResult<DiscoveredInstructor[]> = await getPopularInstructors(callerRole, limit);
      if (result.error) throw result.error;
      return result.data as DiscoveredInstructor[];
    },
  });
}

export function useMajorDistribution() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const callerRole = profile?.role || '';

  return useQuery({
    ...majorDistributionQueryOptions(),
    enabled: isAdmin,
    staleTime: ANALYTICS_STALE_TIME_MS,
    queryFn: async () => {
      const result: ServiceResult<DiscoveredMajor[]> = await getMajorDistribution(callerRole);
      if (result.error) throw result.error;
      return result.data as DiscoveredMajor[];
    },
  });
}
