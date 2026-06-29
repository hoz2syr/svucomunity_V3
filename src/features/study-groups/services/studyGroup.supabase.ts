import { getSupabaseClient } from '@/src/lib/supabase';
import type { StudyGroup, Course } from '../src/types';
import { getCoursesByMajorStatic, getAllMajorsStatic } from './courseCatalog';

export { type StudyGroup, type Course } from '../src/types';
export const getSupabase = (): ReturnType<typeof getSupabaseClient> => getSupabaseClient();

export type ServiceResult<T> = { data: T | null; error: Error | null };

export async function getAllWithCreators(): Promise<ServiceResult<StudyGroup[]>> {
  const { data, error } = await getSupabase()
    .from('groups')
    .select('id, name, course_name, course_code, class_number, doctor_name, major, max_members, current_members, whatsapp_link, group_link, is_full, creator_id, creator_name, created_at')
    .order('created_at', { ascending: false });

  if (error) return { data: null, error: new Error(error.message) };
  return { data: (data || []) as StudyGroup[], error: null };
}

export async function getCreators(userIds: string[]): Promise<ServiceResult<Record<string, { first_name: string; last_name: string; username: string }>>> {
  const { data, error } = await getSupabase()
    .from('profiles')
    .select('id, full_name, username')
    .in('id', userIds);

  if (error) return { data: null, error: new Error(error.message) };

  const map: Record<string, { first_name: string; last_name: string; username: string }> = {};
  for (const user of data || []) {
    const full = user.full_name ?? '';
    const [first_name, ...rest] = full.split(' ');
    map[user.id] = {
      first_name,
      last_name: rest.join(' '),
      username: user.username ?? '',
    };
  }
  return { data: map, error: null };
}

export async function getCoursesByMajor(major: string): Promise<ServiceResult<Course[]>> {
  try {
    const result = await getCoursesByMajorStatic(major);
    return { data: result, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error('فشل تحميل المقررات') };
  }
}

export async function getAvailableMajors(): Promise<ServiceResult<string[]>> {
  try {
    const staticMajors = await getAllMajorsStatic();
    if (staticMajors.length > 0) return { data: staticMajors, error: null };
  } catch {
    // fallback to DB if static catalog fails
  }
  const { data, error } = await getSupabase()
    .from('groups')
    .select('major');

  if (error || !data) return { data: null, error: error ? new Error(error.message) : new Error('فشل تحميل التخصصات') };
  const unique = [...new Set(data.map(g => g.major).filter(Boolean))];
  return { data: unique.sort(), error: null };
}

export async function joinGroup(groupId: string, userId: string): Promise<ServiceResult<void>> {
  const { error: memberError } = await getSupabase()
    .from('group_members')
    .insert({ group_id: groupId, user_id: userId });

  if (memberError) return { data: null, error: new Error(memberError.message) };

  const { data: group, error: groupFetchError } = await getSupabase()
    .from('groups')
    .select('current_members, max_members')
    .eq('id', groupId)
    .single();

  if (groupFetchError) return { data: null, error: new Error(groupFetchError.message) };

  const newCount = (group?.current_members || 0) + 1;
  const isFull = newCount >= (group?.max_members || 1);

  const { error: updateError } = await getSupabase()
    .from('groups')
    .update({ current_members: newCount, is_full: isFull })
    .eq('id', groupId);

  if (updateError) return { data: null, error: new Error(updateError.message) };
  return { data: undefined, error: null };
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
  const { data, error } = await getSupabase()
    .from('groups')
    .insert({
      ...groupData,
      current_members: 1,
      is_full: false,
    })
    .select()
    .single();

  if (error) return { data: null, error: new Error(error.message) };
  if (!data) return { data: null, error: new Error('فشل إنشاء المجموعة') };

  await getSupabase().from('group_members').insert({
    group_id: data.id,
    user_id: groupData.creator_id,
  });

  return { data: data as StudyGroup, error: null };
}

export async function deleteGroup(groupId: string): Promise<ServiceResult<void>> {
  const { error: memberError } = await getSupabase()
    .from('group_members')
    .delete()
    .eq('group_id', groupId);

  if (memberError) return { data: null, error: new Error(memberError.message) };

  const { error: groupError } = await getSupabase()
    .from('groups')
    .delete()
    .eq('id', groupId);

  if (groupError) return { data: null, error: new Error(groupError.message) };
  return { data: undefined, error: null };
}

export async function getGroupMembers(groupId: string): Promise<ServiceResult<unknown[]>> {
  const { data, error } = await getSupabase()
    .from('group_members')
    .select('id, user_id, joined_at')
    .eq('group_id', groupId);

  if (error) return { data: null, error: new Error(error.message) };
  return { data: data || [], error: null };
}

export async function checkMembership(groupId: string, userId: string): Promise<ServiceResult<boolean>> {
  const { data, error } = await getSupabase()
    .from('group_members')
    .select('id')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) return { data: false, error: null };
  return { data: !!data, error: null };
}

export async function checkIsAdmin(userId: string): Promise<ServiceResult<boolean>> {
  try {
    const { data } = await getSupabase()
      .from('users')
      .select('is_admin')
      .eq('id', userId)
      .single();
    return { data: !!data?.is_admin, error: null };
  } catch {
    return { data: false, error: null };
  }
}

export async function leaveGroup(groupId: string, userId: string): Promise<ServiceResult<void>> {
  const { error: memberError } = await getSupabase()
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', userId);

  if (memberError) return { data: null, error: new Error(memberError.message) };

  const { data: group, error: groupFetchError } = await getSupabase()
    .from('groups')
    .select('current_members, max_members')
    .eq('id', groupId)
    .single();

  if (groupFetchError) return { data: null, error: new Error(groupFetchError.message) };

  const newCount = Math.max(0, (group?.current_members || 0) - 1);
  const isFull = newCount >= (group?.max_members || 1);

  const { error: updateError } = await getSupabase()
    .from('groups')
    .update({ current_members: newCount, is_full: isFull })
    .eq('id', groupId);

  if (updateError) return { data: null, error: new Error(updateError.message) };
  return { data: undefined, error: null };
}

export async function updateGroup(groupId: string, updates: {
  name?: string;
  course_name?: string;
  course_code?: string;
  class_number?: string;
  doctor_name?: string;
  major?: string;
  max_members?: number;
  whatsapp_link?: string;
  group_link?: string;
}): Promise<ServiceResult<StudyGroup>> {
  const { data, error } = await getSupabase()
    .from('groups')
    .update(updates)
    .eq('id', groupId)
    .select()
    .single();

  if (error) return { data: null, error: new Error(error.message) };
  if (!data) return { data: null, error: new Error('فشل تحديث المجموعة') };
  return { data: data as StudyGroup, error: null };
}

export async function getMyGroups(userId: string): Promise<ServiceResult<{ created: StudyGroup[]; joined: StudyGroup[] }>> {
  const { data: created, error: createdError } = await getSupabase()
    .from('groups')
    .select('id, name, course_name, course_code, class_number, doctor_name, major, max_members, current_members, whatsapp_link, group_link, is_full, creator_id, creator_name, created_at')
    .eq('creator_id', userId)
    .order('created_at', { ascending: false });

  if (createdError) return { data: null, error: new Error(createdError.message) };

  const { data: memberships, error: memberError } = await getSupabase()
    .from('group_members')
    .select('group_id')
    .eq('user_id', userId);

  if (memberError) return { data: null, error: new Error(memberError.message) };

  const createdIds = new Set((created || []).map(g => g.id));
  const joinedGroupIds = [...new Set((memberships || []).map(m => m.group_id))].filter(id => !createdIds.has(id));

  let joined: StudyGroup[] = [];
  if (joinedGroupIds.length > 0) {
    const { data: joinedData, error: joinedError } = await getSupabase()
      .from('groups')
      .select('id, name, course_name, course_code, class_number, doctor_name, major, max_members, current_members, whatsapp_link, group_link, is_full, creator_id, creator_name, created_at')
      .in('id', joinedGroupIds);
    if (joinedError) return { data: null, error: new Error(joinedError.message) };
    joined = joinedData || [];
  }

  return { data: { created: created || [], joined }, error: null };
}
