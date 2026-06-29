import { getSupabase, type ServiceResult } from './studyGroup.supabase';
import type { StudyGroup, Course, GroupMember } from '../src/types';

const FUNCTION_NAME = 'study-groups';

async function callEdgeFunction<T>(action: string, payload?: Record<string, unknown>): Promise<ServiceResult<T>> {
  const supabase = getSupabase();
  const { data, error } = await supabase.functions.invoke<T>(FUNCTION_NAME, {
    body: { action, payload },
  });

  if (error) return { data: null, error: new Error(error.message) };
  return { data: data as T, error: null };
}

export async function getAllWithCreators(): Promise<ServiceResult<StudyGroup[]>> {
  return callEdgeFunction<StudyGroup[]>('getAll');
}

export async function getMyGroups(_userId: string): Promise<ServiceResult<{ created: StudyGroup[]; joined: StudyGroup[] }>> {
  return callEdgeFunction<{ created: StudyGroup[]; joined: StudyGroup[] }>('getMyGroups');
}

export async function createGroup(groupData: {
  name: string;
  course_name: string;
  course_code: string;
  class_number: string;
  doctor_name: string;
  major: string;
  max_members: number;
  whatsapp_link: string;
  group_link?: string;
  creator_id: string;
  creator_name: string;
}): Promise<ServiceResult<StudyGroup>> {
  return callEdgeFunction<StudyGroup>('create', groupData);
}

export async function joinGroup(groupId: string, _userId: string): Promise<ServiceResult<void>> {
  return callEdgeFunction<void>('join', { groupId });
}

export async function leaveGroup(groupId: string, _userId: string): Promise<ServiceResult<void>> {
  return callEdgeFunction<void>('leave', { groupId });
}

export async function updateGroup(groupId: string, updates: Partial<{
  name: string;
  course_name: string;
  course_code: string;
  class_number: string;
  doctor_name: string;
  major: string;
  max_members: number;
  whatsapp_link: string;
  group_link?: string;
}>): Promise<ServiceResult<StudyGroup>> {
  return callEdgeFunction<StudyGroup>('update', { groupId, updates });
}

export async function deleteGroup(groupId: string): Promise<ServiceResult<void>> {
  return callEdgeFunction<void>('delete', { groupId });
}

export async function getGroupMembers(groupId: string): Promise<ServiceResult<GroupMember[]>> {
  return callEdgeFunction<GroupMember[]>('getMembers', { groupId });
}

export async function checkMembership(groupId: string, _userId: string): Promise<ServiceResult<boolean>> {
  return callEdgeFunction<boolean>('checkMembership', { groupId });
}

export async function checkIsAdmin(_userId: string): Promise<ServiceResult<boolean>> {
  return callEdgeFunction<boolean>('checkIsAdmin');
}

export async function getCoursesByMajor(major: string): Promise<ServiceResult<Course[]>> {
  return callEdgeFunction<Course[]>('getCoursesByMajor', { major });
}

export async function getAvailableMajors(): Promise<ServiceResult<string[]>> {
  return callEdgeFunction<string[]>('getAvailableMajors');
}
