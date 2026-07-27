'use client';

import { useQuery, useMutation, queryOptions, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/src/contexts/AuthContext';
import {
  loadUnverifiedCourses,
  loadUnverifiedInstructors,
  verifyDiscoveredCourse,
  verifyDiscoveredInstructor,
} from '../services/adminVerificationService.supabase';
import type { DiscoveredCourse, DiscoveredInstructor } from '@/src/types/database';

export const unverifiedCoursesQueryOptions = (callerId: string, callerRole: string, page = 1, limit = 50) =>
  queryOptions({
    queryKey: ['admin', 'unverified-courses', page, limit],
    queryFn: async (): Promise<{ items: DiscoveredCourse[]; totalCount: number }> => {
      const result = await loadUnverifiedCourses(callerId, callerRole, page, limit);
      if (result.error) throw result.error;
      return { items: result.data as DiscoveredCourse[], totalCount: result.totalCount };
    },
  });

export const unverifiedInstructorsQueryOptions = (callerId: string, callerRole: string, page = 1, limit = 50) =>
  queryOptions({
    queryKey: ['admin', 'unverified-instructors', page, limit],
    queryFn: async (): Promise<{ items: DiscoveredInstructor[]; totalCount: number }> => {
      const result = await loadUnverifiedInstructors(callerId, callerRole, page, limit);
      if (result.error) throw result.error;
      return { items: result.data as DiscoveredInstructor[], totalCount: result.totalCount };
    },
  });

export function useUnverifiedCourses(page = 1, limit = 50, enabled?: boolean) {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const callerId = profile?.id || '';
  const callerRole = profile?.role || '';

  return useQuery({
    ...unverifiedCoursesQueryOptions(callerId, callerRole, page, limit),
    enabled: enabled ?? isAdmin,
  });
}

export function useUnverifiedInstructors(page = 1, limit = 50, enabled?: boolean) {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const callerId = profile?.id || '';
  const callerRole = profile?.role || '';

  return useQuery({
    ...unverifiedInstructorsQueryOptions(callerId, callerRole, page, limit),
    enabled: enabled ?? isAdmin,
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
        throw new Error('غير مصرح');
      }
      const result = await verifyDiscoveredCourse(courseCode, isVerified, userId, callerRole);
      if (result.error) throw result.error;
      return result.data as DiscoveredCourse;
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
        throw new Error('غير مصرح');
      }
      const result = await verifyDiscoveredInstructor(instructorUsername, isVerified, userId, callerRole);
      if (result.error) throw result.error;
      return result.data as DiscoveredInstructor;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'unverified-instructors'] });
    },
  });
}
