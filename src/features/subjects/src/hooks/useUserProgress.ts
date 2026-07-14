import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { hasSupabaseEnv } from '@/src/lib/env';
import { fetchUserProgress, saveUserProgress, removeUserProgress } from '../services/subjects.service';
import type { UserCourseProgress, UserCourseProgressInsert } from '../types';

export function useUserProgress() {
  const queryClient = useQueryClient();
  const { session, envMissing } = useAuth();
  const userId = session?.user?.id;

  const { data: cloudProgress = [], isLoading, error } = useQuery<UserCourseProgress[]>({
    queryKey: ['user-course-progress', userId],
    queryFn: () => {
      if (!userId) return Promise.resolve([]);
      return fetchUserProgress(userId).then((result) => {
        if (result.error) throw result.error;
        return result.data as UserCourseProgress[];
      });
    },
    enabled: hasSupabaseEnv() && !envMissing && Boolean(userId),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });

  const syncMutation = useMutation({
    mutationFn: ({ userId, progress }: { userId: string; progress: UserCourseProgressInsert }) =>
      saveUserProgress(userId, progress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-course-progress', userId] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: ({ userId, course_code }: { userId: string; course_code: string }) =>
      removeUserProgress(userId, course_code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-course-progress', userId] });
    },
  });

  const syncProgress = (courseCode: string, status: 'passed' | 'carried') => {
    if (!userId) return Promise.resolve(null);
    return syncMutation.mutateAsync({ userId, progress: { course_code: courseCode, status } });
  };

  const removeProgress = (courseCode: string) => {
    if (!userId) return Promise.resolve(null);
    return removeMutation.mutateAsync({ userId, course_code: courseCode });
  };

  const progressMap = useMemo(() => {
    const map = new Map<string, UserCourseProgress>();
    cloudProgress.forEach((p) => map.set(p.course_code, p));
    return map;
  }, [cloudProgress]);

  return {
    cloudProgress,
    progressMap,
    isLoading,
    error: error ? (error as Error).message : null,
    syncProgress,
    removeProgress,
    isSyncing: syncMutation.isPending,
    isRemoving: removeMutation.isPending,
    hasCloudData: cloudProgress.length > 0,
    isLoggedIn: Boolean(userId),
  };
}
