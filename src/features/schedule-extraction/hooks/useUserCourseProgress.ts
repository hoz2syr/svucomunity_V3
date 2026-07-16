'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/src/contexts/AuthContext';
import { loadProgress } from '@/src/features/courses/src/services/courses.supabase';
import type { UserCourseProgress } from '@/src/types/database';

export function useUserCourseProgress() {
  const { session } = useAuth();
  const userId = session?.user?.id;

  return useQuery({
    queryKey: ['user-course-progress', userId],
    queryFn: async (): Promise<UserCourseProgress[]> => {
      if (!userId) return [];
      const result = await loadProgress(userId);
      if (result.error) throw result.error;
      return result.data ?? [];
    },
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
  });
}

export function getProgressForCourse(
  progress: UserCourseProgress[],
  courseCode: string
): UserCourseProgress | undefined {
  return progress.find((p) => p.course_code === courseCode);
}
