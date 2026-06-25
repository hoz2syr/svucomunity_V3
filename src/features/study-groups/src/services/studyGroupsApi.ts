import { getSupabase } from './studyGroup.supabase';
import type { StudyGroup, Course, GroupMember } from '../types';

const FUNCTION_NAME = 'study-groups';

async function callEdgeFunction<T>(action: string, payload?: Record<string, unknown>): Promise<T> {
  const supabase = getSupabase();
  const { data, error } = await supabase.functions.invoke<T>(FUNCTION_NAME, {
    body: { action, payload },
  });

  if (error) throw new Error(error.message);
  return data as T;
}

export async function getAllWithCreators(): Promise<StudyGroup[]> {
  return callEdgeFunction<StudyGroup[]>('getAll');
}

export async function getMyGroups(_userId: string): Promise<{ created: StudyGroup[]; joined: StudyGroup[] }> {
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
}): Promise<StudyGroup> {
  return callEdgeFunction<StudyGroup>('create', groupData);
}

export async function joinGroup(groupId: string, _userId: string): Promise<void> {
  await callEdgeFunction<void>('join', { groupId });
}

export async function leaveGroup(groupId: string, _userId: string): Promise<void> {
  await callEdgeFunction<void>('leave', { groupId });
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
}>): Promise<StudyGroup> {
  return callEdgeFunction<StudyGroup>('update', { groupId, updates });
}

export async function deleteGroup(groupId: string): Promise<void> {
  await callEdgeFunction<void>('delete', { groupId });
}

export async function getGroupMembers(groupId: string): Promise<GroupMember[]> {
  return callEdgeFunction<GroupMember[]>('getMembers', { groupId });
}

export async function checkMembership(groupId: string, _userId: string): Promise<boolean> {
  return callEdgeFunction<boolean>('checkMembership', { groupId });
}

export async function checkIsAdmin(_userId: string): Promise<boolean> {
  return callEdgeFunction<boolean>('checkIsAdmin');
}

export async function getCoursesByMajor(major: string): Promise<Course[]> {
  return callEdgeFunction<Course[]>('getCoursesByMajor', { major });
}

export async function getAvailableMajors(): Promise<string[]> {
  return callEdgeFunction<string[]>('getAvailableMajors');
}
