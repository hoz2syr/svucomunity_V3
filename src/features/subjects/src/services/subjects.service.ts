import type { Course } from '@/src/features/courses/src/types';
import { coursesDB } from '@/src/features/courses/src/data/coursesData';
import type { SubjectReference, SubjectReferenceInsert, UserCourseProgress, UserCourseProgressInsert } from '../types';
import {
  getReferencesByCourseCode,
  insertReference as supabaseInsertReference,
  deleteReference as supabaseDeleteReference,
  loadUserProgress,
  upsertUserProgress,
  deleteUserProgress,
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
  return subjects.filter((subject) => {
    if (subject.level === 'ENG') return false;
    const levelNum = typeof subject.level === 'number' ? subject.level : 0;
    const majorNum = parseInt(major, 10);
    return levelNum === majorNum || subject.name.includes(major);
  });
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

export async function removeReference(id: string): Promise<ServiceResult<null>> {
  return supabaseDeleteReference(id);
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
