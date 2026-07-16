'use client';

import { useQuery, useMutation, queryOptions, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/src/contexts/AuthContext';
import {
  loadUnverifiedCourses,
  loadUnverifiedInstructors,
  verifyDiscoveredCourse,
  verifyDiscoveredInstructor,
} from '../services/adminVerificationService.supabase';
import type { ServiceResult } from '@/src/types/admin';
import type { DiscoveredCourse, DiscoveredInstructor } from '@/src/types/database';

export const unverifiedCoursesQueryOptions = (callerRole: string, page = 1, limit = 50) =>
  queryOptions({
    queryKey: ['admin', 'unverified-courses', page, limit],
    queryFn: async (): Promise<DiscoveredCourse[]> => {
      const result: ServiceResult<DiscoveredCourse[]> = await loadUnverifiedCourses(callerRole, page, limit);
      if (result.error) throw result.error;
      return result.data as DiscoveredCourse[];
    },
  });

export const unverifiedInstructorsQueryOptions = (callerRole: string, page = 1, limit = 50) =>
  queryOptions({
    queryKey: ['admin', 'unverified-instructors', page, limit],
    queryFn: async (): Promise<DiscoveredInstructor[]> => {
      const result: ServiceResult<DiscoveredInstructor[]> = await loadUnverifiedInstructors(callerRole, page, limit);
      if (result.error) throw result.error;
      return result.data as DiscoveredInstructor[];
    },
  });

export function useUnverifiedCourses(page = 1, limit = 50) {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const callerRole = profile?.role || '';

  return useQuery({
    ...unverifiedCoursesQueryOptions(callerRole, page, limit),
    enabled: isAdmin,
  });
}

export function useUnverifiedInstructors(page = 1, limit = 50) {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const callerRole = profile?.role || '';

  return useQuery({
    ...unverifiedInstructorsQueryOptions(callerRole, page, limit),
    enabled: isAdmin,
  });
}

export function useVerifyCourse() {
  const { profile } = useAuth();
  const userId = profile?.id || '';
  const callerRole = profile?.role || '';
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseCode, isVerified }: { courseCode: string; isVerified: boolean }) => {
      if (!userId || callerRole !== 'admin') {
        return { data: null, error: new Error('غير مصرح') } as ServiceResult<DiscoveredCourse>;
      }
      return verifyDiscoveredCourse(courseCode, isVerified, userId, callerRole);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'unverified-courses'] });
    },
  });
}

export function useVerifyInstructor() {
  const { profile } = useAuth();
  const userId = profile?.id || '';
  const callerRole = profile?.role || '';
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ instructorUsername, isVerified }: { instructorUsername: string; isVerified: boolean }) => {
      if (!userId || callerRole !== 'admin') {
        return { data: null, error: new Error('غير مصرح') } as ServiceResult<DiscoveredInstructor>;
      }
      return verifyDiscoveredInstructor(instructorUsername, isVerified, userId, callerRole);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'unverified-instructors'] });
    },
  });
}
