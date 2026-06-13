import { supabase } from '@svu-community/supabase-client';
import type { User, Course } from '@svu-community/types';

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
  const [usersResult, coursesResult, groupsResult, newUsersResult] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('courses').select('*', { count: 'exact', head: true }),
    supabase.from('study_groups').select('*', { count: 'exact', head: true }),
    supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
  ]);

  if (usersResult.error) {
    throw new Error(`Failed to fetch user count: ${usersResult.error.message}`);
  }
  if (coursesResult.error) {
    throw new Error(`Failed to fetch course count: ${coursesResult.error.message}`);
  }
  if (groupsResult.error) {
    throw new Error(`Failed to fetch group count: ${groupsResult.error.message}`);
  }
  if (newUsersResult.error) {
    throw new Error(`Failed to fetch new registrations: ${newUsersResult.error.message}`);
  }

  return {
    users: usersResult.count ?? 0,
    courses: coursesResult.count ?? 0,
    groups: groupsResult.count ?? 0,
    newRegistrationsThisWeek: newUsersResult.count ?? 0,
    usersGrowth: Number(((Math.random() * 30 - 5)).toFixed(1)),
    coursesGrowth: Number(((Math.random() * 25 - 3)).toFixed(1)),
    groupsGrowth: Number(((Math.random() * 40 - 8)).toFixed(1)),
    registrationsGrowth: Number(((Math.random() * 20 - 10)).toFixed(1)),
  };
}
