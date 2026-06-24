import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { StudyGroup, Course } from '../types';
import { getCoursesByMajorStatic, getAllMajorsStatic } from './courseCatalog';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let cachedClient: SupabaseClient | null = null;

function createSupabaseClient(): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

export function getSupabase(): SupabaseClient {
  if (!cachedClient) {
    cachedClient = createSupabaseClient();
  }
  return cachedClient;
}

export async function getAllWithCreators(): Promise<StudyGroup[]> {
  const { data, error } = await getSupabase()
    .from('groups')
    .select('id, name, course_name, course_code, class_number, doctor_name, major, max_members, current_members, whatsapp_link, group_link, is_full, creator_id, creator_name, created_at')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data || []) as StudyGroup[];
}

export async function getCreators(userIds: string[]): Promise<Record<string, { first_name: string; last_name: string; username: string }>> {
  const { data, error } = await getSupabase()
    .from('users')
    .select('id, first_name, last_name, username')
    .in('id', userIds);

  if (error) throw new Error(error.message);

  const map: Record<string, { first_name: string; last_name: string; username: string }> = {};
  for (const user of data || []) {
    map[user.id] = {
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      username: user.username || '',
    };
  }
  return map;
}

export async function getCoursesByMajor(major: string): Promise<Course[]> {
  return getCoursesByMajorStatic(major);
}

export async function getAvailableMajors(): Promise<string[]> {
  try {
    const staticMajors = await getAllMajorsStatic();
    if (staticMajors.length > 0) return staticMajors;
  } catch {
    // fallback to DB if static catalog fails
  }
  const { data, error } = await getSupabase()
    .from('groups')
    .select('major');

  if (error || !data) return [];
  const unique = [...new Set(data.map(g => g.major).filter(Boolean))];
  return unique.sort();
}

export async function joinGroup(groupId: string, userId: string): Promise<void> {
  const { error: memberError } = await getSupabase()
    .from('group_members')
    .insert({ group_id: groupId, user_id: userId });

  if (memberError) throw new Error(memberError.message);

  const { data: group, error: groupFetchError } = await getSupabase()
    .from('groups')
    .select('current_members, max_members')
    .eq('id', groupId)
    .single();

  if (groupFetchError) throw new Error(groupFetchError.message);

  const newCount = (group?.current_members || 0) + 1;
  const isFull = newCount >= (group?.max_members || 1);

  const { error: updateError } = await getSupabase()
    .from('groups')
    .update({ current_members: newCount, is_full: isFull })
    .eq('id', groupId);

  if (updateError) throw new Error(updateError.message);
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
  const { data, error } = await getSupabase()
    .from('groups')
    .insert({
      ...groupData,
      current_members: 1,
      is_full: false,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  if (!data) throw new Error('فشل إنشاء المجموعة');

  await getSupabase().from('group_members').insert({
    group_id: data.id,
    user_id: groupData.creator_id,
  });

  return data as StudyGroup;
}

export async function deleteGroup(groupId: string): Promise<void> {
  const { error: memberError } = await getSupabase()
    .from('group_members')
    .delete()
    .eq('group_id', groupId);

  if (memberError) throw new Error(memberError.message);

  const { error: groupError } = await getSupabase()
    .from('groups')
    .delete()
    .eq('id', groupId);

  if (groupError) throw new Error(groupError.message);
}

export async function getGroupMembers(groupId: string) {
  const { data, error } = await getSupabase()
    .from('group_members')
    .select('id, user_id, joined_at')
    .eq('group_id', groupId);

  if (error) throw new Error(error.message);
  return data || [];
}

export async function checkMembership(groupId: string, userId: string): Promise<boolean> {
  const { data, error } = await getSupabase()
    .from('group_members')
    .select('id')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.warn('Failed to check membership:', error.message);
    return false;
  }
  return !!data;
}

export async function checkIsAdmin(userId: string): Promise<boolean> {
  try {
    const { data } = await getSupabase()
      .from('users')
      .select('is_admin')
      .eq('id', userId)
      .single();
    return !!data?.is_admin;
  } catch {
    return false;
  }
}
