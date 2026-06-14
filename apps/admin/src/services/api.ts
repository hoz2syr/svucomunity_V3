import { supabase } from '@svu-community/supabase-client';
import type { User, Course } from '@svu-community/types';

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

/**
 * Fetch all users from the profiles table
 * @returns Array of user objects
 * @throws Error if the query fails
 */
export async function getUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*');

  if (error) {
    throw new Error(`Failed to fetch users: ${error.message}`);
  }

  return data ?? [];
}

/**
 * Update a user's admin role
 * @param userId - The ID of the user to update
 * @param role - The new role value (true for admin, false for regular user)
 * @returns The updated user object
 * @throws Error if the update fails
 */
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

/**
 * Toggle a user's active status
 * @param userId - The ID of the user to toggle
 * @returns The updated user object with the new active status
 * @throws Error if the toggle fails
 */
export async function toggleUserActive(userId: string): Promise<User> {
  const { data: current, error: fetchError } = await supabase
    .from('users')
    .select('is_active')
    .eq('id', userId)
    .single();

  if (fetchError || !current) {
    throw new Error(`Failed to fetch user for toggle: ${fetchError?.message ?? 'User not found'}`);
  }

  const { data, error } = await supabase
    .from('users')
    .update({ is_active: !current.is_active })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to toggle user active status: ${error.message}`);
  }

  return data;
}

/**
 * Fetch all courses with their related data
 * @returns Array of course objects
 * @throws Error if the query fails
 */
export async function getCourses(): Promise<Course[]> {
  const { data, error } = await supabase
    .from('courses')
    .select('*');

  if (error) {
    throw new Error(`Failed to fetch courses: ${error.message}`);
  }

  return data ?? [];
}

/**
 * Create a new course
 * @param data - The course data to insert
 * @returns The created course object
 * @throws Error if creation fails
 */
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

/**
 * Update an existing course
 * @param courseId - The ID of the course to update
 * @param data - The fields to update
 * @returns The updated course object
 * @throws Error if the update fails
 */
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

/**
 * Delete a course by ID
 * @param courseId - The ID of the course to delete
 * @throws Error if deletion fails
 */
export async function deleteCourse(courseId: string): Promise<void> {
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', courseId);

  if (error) {
    throw new Error(`Failed to delete course: ${error.message}`);
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

/**
 * Fetch dashboard statistics
 * @returns Object containing counts for users, courses, and groups
 * @throws Error if any count query fails
 */
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

  if (usersResult.error) throw new Error(`Failed to fetch user count: ${usersResult.error.message}`);
  if (coursesResult.error) throw new Error(`Failed to fetch course count: ${coursesResult.error.message}`);
  if (groupsResult.error) throw new Error(`Failed to fetch group count: ${groupsResult.error.message}`);
  if (newUsersResult.error) throw new Error(`Failed to fetch new registrations: ${newUsersResult.error.message}`);

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
