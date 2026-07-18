import type { Course } from '@/src/features/courses/src/types';
import { coursesDB } from '@/src/features/courses/src/data/coursesData';
import type { SubjectReference, SubjectReferenceInsert, SubjectReferenceUpdate, UserCourseProgress, UserCourseProgressInsert, BulkImportItem, BulkImportResult } from '../types';
import {
  getReferencesByCourseCode,
  insertReference as supabaseInsertReference,
  updateReference as supabaseUpdateReference,
  deleteReference as supabaseDeleteReference,
  likeReference as supabaseLikeReference,
  unlikeReference as supabaseUnlikeReference,
  checkUserLikedReference as supabaseCheckUserLiked,
  fetchUserReferences as supabaseFetchUserReferences,
  fetchAllReferences as supabaseFetchAllReferences,
  loadUserProgress,
  upsertUserProgress,
  deleteUserProgress,
  bulkInsertReferences as supabaseBulkInsertReferences,
} from './subjects.supabase';

export type ServiceResult<T> = { data: T | null; error: Error | null };

export interface Subject extends Course {
  id: string;
}

export function getAllSubjects(): Subject[] {
  return Object.entries(coursesDB).map(([code, course]) => ({
    ...course,
    id: code,
  }));
}

export function getSubjectByCode(courseCode: string): Subject | undefined {
  const course = coursesDB[courseCode];
  if (!course) return undefined;
  return { ...course, id: courseCode };
}

export function filterSubjectsByMajor(subjects: Subject[], major?: string | null): Subject[] {
  if (!major) return subjects;

  const majorNum = parseInt(major, 10);

  if (!isNaN(majorNum)) {
    const levelNum = typeof majorNum === 'number' ? majorNum : 0;
    return subjects.filter((subject) => {
      if (subject.level === 'ENG') return false;
      const subjectLevel = typeof subject.level === 'number' ? subject.level : 0;
      return subjectLevel === levelNum;
    });
  }

  return subjects.filter((subject) => subject.level !== 'ENG');
}

export async function fetchReferences(courseCode: string): Promise<ServiceResult<SubjectReference[]>> {
  return getReferencesByCourseCode(courseCode);
}

export async function addReference(
  userId: string,
  reference: SubjectReferenceInsert
): Promise<ServiceResult<SubjectReference>> {
  return supabaseInsertReference(userId, reference);
}

export async function updateReference(
  id: string,
  updates: SubjectReferenceUpdate
): Promise<ServiceResult<SubjectReference>> {
  return supabaseUpdateReference(id, updates);
}

export async function removeReference(id: string): Promise<ServiceResult<null>> {
  return supabaseDeleteReference(id);
}

export async function likeReference(referenceId: string, userId: string): Promise<ServiceResult<null>> {
  return supabaseLikeReference(referenceId, userId);
}

export async function unlikeReference(referenceId: string, userId: string): Promise<ServiceResult<null>> {
  return supabaseUnlikeReference(referenceId, userId);
}

export async function checkUserLikedReference(referenceId: string, userId: string): Promise<ServiceResult<boolean>> {
  return supabaseCheckUserLiked(referenceId, userId);
}

export async function fetchUserReferences(userId: string): Promise<ServiceResult<SubjectReference[]>> {
  return supabaseFetchUserReferences(userId);
}

export async function fetchAllReferences(): Promise<ServiceResult<SubjectReference[]>> {
  return supabaseFetchAllReferences();
}

export async function fetchUserProgress(userId: string): Promise<ServiceResult<UserCourseProgress[]>> {
  return loadUserProgress(userId);
}

export async function saveUserProgress(
  userId: string,
  progress: UserCourseProgressInsert
): Promise<ServiceResult<UserCourseProgress>> {
  return upsertUserProgress(userId, progress);
}

export async function removeUserProgress(userId: string, courseCode: string): Promise<ServiceResult<null>> {
  return deleteUserProgress(userId, courseCode);
}

export async function bulkInsertReferences(
  adminId: string,
  items: BulkImportItem[],
  batchSize = 50
): Promise<ServiceResult<BulkImportResult>> {
  return supabaseBulkInsertReferences(adminId, items, batchSize);
}
