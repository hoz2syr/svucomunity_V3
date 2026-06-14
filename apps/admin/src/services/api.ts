import { supabase } from '@svu-community/supabase-client';
import type { User, Course, Group } from '@svu-community/types';

export interface AppSettings {
  siteName: string;
  siteDescription: string;
  defaultTheme: 'light' | 'dark' | 'system';
  allowNewRegistrations: boolean;
  maintenanceMode: boolean;
}

export interface SettingsUpdatePayload {
  siteName?: string;
  siteDescription?: string;
  defaultTheme?: 'light' | 'dark' | 'system';
  allowNewRegistrations?: boolean;
  maintenanceMode?: boolean;
}

export interface ConnectionTestResult {
  success: boolean;
  latency: number;
  timestamp: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  siteName: 'SVU Community',
  siteDescription: 'University Student Platform',
  defaultTheme: 'system',
  allowNewRegistrations: true,
  maintenanceMode: false,
};

export async function getUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*');

  if (error) {
    throw new Error(`Failed to fetch users: ${error.message}`);
  }

  return data ?? [];
}

export async function updateUserRole(userId: string, role: boolean): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .update({ is_admin: role })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update user role: ${error.message}`);
  }

  return data;
}

export async function setUserActive(userId: string, isActive: boolean): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .update({ is_active: isActive })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update user status: ${error.message}`);
  }

  return data;
}

export async function getCourses(): Promise<Course[]> {
  const { data, error } = await supabase
    .from('courses')
    .select('*');

  if (error) {
    throw new Error(`Failed to fetch courses: ${error.message}`);
  }

  return data ?? [];
}

export async function createCourse(data: Partial<Course>): Promise<Course> {
  const { data: course, error } = await supabase
    .from('courses')
    .insert(data)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create course: ${error.message}`);
  }

  return course;
}

export async function updateCourse(courseId: string, data: Partial<Course>): Promise<Course> {
  const { data: course, error } = await supabase
    .from('courses')
    .update(data)
    .eq('id', courseId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update course: ${error.message}`);
  }

  return course;
}

export async function deleteCourse(courseId: string): Promise<void> {
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', courseId);

  if (error) {
    throw new Error(`Failed to delete course: ${error.message}`);
  }
}

export async function getGroups(): Promise<Group[]> {
  const { data, error } = await supabase
    .from('study_groups')
    .select(`
      *,
      courses ( code, name, major )
    `);

  if (error) {
    throw new Error(`Failed to fetch groups: ${error.message}`);
  }

  return data ?? [];
}

export async function updateGroupStatus(groupId: string, isActive: boolean): Promise<Group> {
  const { data, error } = await supabase
    .from('study_groups')
    .update({ is_active: isActive })
    .eq('id', groupId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update group status: ${error.message}`);
  }

  return data;
}

export async function deleteGroup(groupId: string): Promise<void> {
  const { error } = await supabase
    .from('study_groups')
    .delete()
    .eq('id', groupId);

  if (error) {
    throw new Error(`Failed to delete group: ${error.message}`);
  }
}

export interface DashboardStats {
  users: number;
  courses: number;
  groups: number;
  newRegistrationsThisWeek: number;
  usersGrowth: number;
  coursesGrowth: number;
  groupsGrowth: number;
  registrationsGrowth: number;
}

export async function getStats(): Promise<DashboardStats> {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();

  const [
    usersResult,
    coursesResult,
    groupsResult,
    newUsersResult,
    prevUsersResult,
    prevCoursesResult,
    prevGroupsResult,
    prevNewUsersResult,
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('courses').select('*', { count: 'exact', head: true }),
    supabase.from('study_groups').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo),
    supabase.from('users').select('*', { count: 'exact', head: true }).lt('created_at', weekAgo).gte('created_at', twoWeeksAgo),
    supabase.from('courses').select('*', { count: 'exact', head: true }).lt('created_at', weekAgo).gte('created_at', twoWeeksAgo),
    supabase.from('study_groups').select('*', { count: 'exact', head: true }).lt('created_at', weekAgo).gte('created_at', twoWeeksAgo),
    supabase.from('users').select('*', { count: 'exact', head: true }).lt('created_at', weekAgo).gte('created_at', twoWeeksAgo),
  ]);

  const errors: string[] = [];
  if (usersResult.error) errors.push(`users: ${usersResult.error.message}`);
  if (coursesResult.error) errors.push(`courses: ${coursesResult.error.message}`);
  if (groupsResult.error) errors.push(`groups: ${groupsResult.error.message}`);
  if (newUsersResult.error) errors.push(`newUsers: ${newUsersResult.error.message}`);
  if (prevUsersResult.error) errors.push(`prevUsers: ${prevUsersResult.error.message}`);
  if (prevCoursesResult.error) errors.push(`prevCourses: ${prevCoursesResult.error.message}`);
  if (prevGroupsResult.error) errors.push(`prevGroups: ${prevGroupsResult.error.message}`);
  if (prevNewUsersResult.error) errors.push(`prevNewUsers: ${prevNewUsersResult.error.message}`);

  if (errors.length > 0) {
    throw new Error(`Failed to fetch dashboard stats: ${errors.join('; ')}`);
  }

  const currentUsers = usersResult.count ?? 0;
  const prevUsers = prevUsersResult.count ?? 0;
  const currentCourses = coursesResult.count ?? 0;
  const prevCourses = prevCoursesResult.count ?? 0;
  const currentGroups = groupsResult.count ?? 0;
  const prevGroups = prevGroupsResult.count ?? 0;
  const currentRegistrations = newUsersResult.count ?? 0;
  const prevRegistrations = prevNewUsersResult.count ?? 0;

  const calcGrowth = (current: number, prev: number) =>
    prev === 0 ? (current > 0 ? 100 : 0) : Number(((current - prev) / prev * 100).toFixed(1));

  return {
    users: currentUsers,
    courses: currentCourses,
    groups: currentGroups,
    newRegistrationsThisWeek: currentRegistrations,
    usersGrowth: calcGrowth(currentUsers, prevUsers),
    coursesGrowth: calcGrowth(currentCourses, prevCourses),
    groupsGrowth: calcGrowth(currentGroups, prevGroups),
    registrationsGrowth: calcGrowth(currentRegistrations, prevRegistrations),
  };
}

export async function fetchSettings(): Promise<AppSettings> {
  const { data, error } = await supabase
    .from('app_settings')
    .select('*')
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch settings: ${error.message}`);
  }

  if (!data) {
    return DEFAULT_SETTINGS;
  }

  return {
    siteName: data.site_name ?? DEFAULT_SETTINGS.siteName,
    siteDescription: data.site_description ?? DEFAULT_SETTINGS.siteDescription,
    defaultTheme: data.default_theme ?? DEFAULT_SETTINGS.defaultTheme,
    allowNewRegistrations: data.allow_new_registrations ?? DEFAULT_SETTINGS.allowNewRegistrations,
    maintenanceMode: data.maintenance_mode ?? DEFAULT_SETTINGS.maintenanceMode,
  };
}

export async function updateSettings(payload: SettingsUpdatePayload): Promise<AppSettings> {
  const { data, error } = await supabase
    .from('app_settings')
    .upsert({
      id: 'global',
      site_name: payload.siteName,
      site_description: payload.siteDescription,
      default_theme: payload.defaultTheme,
      allow_new_registrations: payload.allowNewRegistrations,
      maintenance_mode: payload.maintenanceMode,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update settings: ${error.message}`);
  }

  return {
    siteName: data.site_name ?? DEFAULT_SETTINGS.siteName,
    siteDescription: data.site_description ?? DEFAULT_SETTINGS.siteDescription,
    defaultTheme: data.default_theme ?? DEFAULT_SETTINGS.defaultTheme,
    allowNewRegistrations: data.allow_new_registrations ?? DEFAULT_SETTINGS.allowNewRegistrations,
    maintenanceMode: data.maintenance_mode ?? DEFAULT_SETTINGS.maintenanceMode,
  };
}

export async function testSupabaseConnection(): Promise<ConnectionTestResult> {
  const start = performance.now();
  try {
    const { error } = await supabase.from('users').select('id').limit(1);
    const latency = Math.round(performance.now() - start);
    if (error) {
      return { success: false, latency, timestamp: new Date().toISOString() };
    }
    return { success: true, latency, timestamp: new Date().toISOString() };
  } catch {
    const latency = Math.round(performance.now() - start);
    return { success: false, latency, timestamp: new Date().toISOString() };
  }
}
