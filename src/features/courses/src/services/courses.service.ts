import type { UserCourseProgress, UserCourseProgressInsert } from '@/src/types/database';
import { loadProgress, saveProgress, deleteProgress } from './courses.supabase';

export type ServiceResult<T> = { data: T | null; error: Error | null };

export async function fetchUserProgress(userId: string): Promise<ServiceResult<UserCourseProgress[]>> {
  return loadProgress(userId);
}

export async function upsertUserProgress(
  userId: string,
  progress: UserCourseProgressInsert
): Promise<ServiceResult<UserCourseProgress>> {
  return saveProgress(userId, progress);
}

export async function removeUserProgress(
  userId: string,
  courseCode: string
): Promise<ServiceResult<null>> {
  return deleteProgress(userId, courseCode);
}
