import { supabase } from '@svu-community/supabase-client';
import type { User, Course, Group } from '@svu-community/types';

function safeError(error: unknown, fallback: string): string {
  if (!error) return fallback;
  const message = error instanceof Error ? error.message : String(error);
  const lower = message.toLowerCase();

  if (lower.includes('jwt') || lower.includes('token')) return 'انتهت صلاحية الجلسة. سجّل دخولك مجدداً.';
  if (lower.includes('permission') || lower.includes('policy') || lower.includes('rls')) return 'ليس لديك صلاحية لهذا الإجراء.';
  if (lower.includes('unauthorized') || lower.includes('forbidden')) return 'غير مصرح لك بتنفيذ هذا الإجراء.';
  if (lower.includes('not found') || lower.includes('no rows')) return 'المطلوب غير موجود.';
  if (lower.includes('duplicate') || lower.includes('unique')) return 'هذا العنصر مسجل مسبقاً.';
  if (lower.includes('password')) return 'كلمة المرور غير صحيحة.';
  if (lower.includes('network') || lower.includes('fetch')) return 'تعذر الاتصال بالخادم. حاول مرة أخرى.';
  if (lower.includes('rate_limit')) return 'تم تجاوز الحد المسموح. حاول لاحقاً.';

  return fallback;
}

async function assertAdmin(): Promise<void> {
  const { error } = await supabase.rpc('services.assert_admin');
  if (error) throw new Error(safeError(error, 'فشل التحقق من صلاحية الأدمن.'));
}

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
  await assertAdmin();
  const { data, error } = await supabase
    .from('users')
    .select('*');

  if (error) {
    throw new Error(safeError(error, 'فشل تحميل المستخدمين.'));
  }

  return data ?? [];
}

export async function updateUserRole(userId: string, role: boolean): Promise<User> {
  await assertAdmin();
  const { data, error } = await supabase
    .from('users')
    .update({ is_admin: role })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(safeError(error, 'فشل تحديث صلاحية المستخدم.'));
  }

  return data;
}

export async function setUserActive(userId: string, isActive: boolean): Promise<User> {
  await assertAdmin();
  const { data, error } = await supabase
    .from('users')
    .update({ is_active: isActive })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(safeError(error, 'فشل تحديث حالة المستخدم.'));
  }

  return data;
}

export async function getCourses(): Promise<Course[]> {
  await assertAdmin();
  const { data, error } = await supabase
    .from('courses')
    .select('*');

  if (error) {
    throw new Error(safeError(error, 'فشل تحميل المقررات.'));
  }

  return data ?? [];
}

export async function createCourse(data: Partial<Course>): Promise<Course> {
  await assertAdmin();
  const { data: course, error } = await supabase
    .from('courses')
    .insert(data)
    .select()
    .single();

  if (error) {
    throw new Error(safeError(error, 'فشل إنشاء المقرر.'));
  }

  return course;
}

export async function updateCourse(courseId: string, data: Partial<Course>): Promise<Course> {
  await assertAdmin();
  const { data: course, error } = await supabase
    .from('courses')
    .update(data)
    .eq('id', courseId)
    .select()
    .single();

  if (error) {
    throw new Error(safeError(error, 'فشل تحديث المقرر.'));
  }

  return course;
}

export async function deleteCourse(courseId: string): Promise<void> {
  await assertAdmin();
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', courseId);

  if (error) {
    throw new Error(safeError(error, 'فشل حذف المقرر.'));
  }
}

export async function getGroups(): Promise<Group[]> {
  await assertAdmin();
  const { data, error } = await supabase
    .from('study_groups')
    .select(`
      *,
      courses ( code, name, major )
    `);

  if (error) {
    throw new Error(safeError(error, 'فشل تحميل المجموعات.'));
  }

  return data ?? [];
}

export async function updateGroupStatus(groupId: string, isActive: boolean): Promise<Group> {
  await assertAdmin();
  const { data, error } = await supabase
    .from('study_groups')
    .update({ is_active: isActive })
    .eq('id', groupId)
    .select()
    .single();

  if (error) {
    throw new Error(safeError(error, 'فشل تحديث حالة المجموعة.'));
  }

  return data;
}

export async function deleteGroup(groupId: string): Promise<void> {
  await assertAdmin();
  const { error } = await supabase
    .from('study_groups')
    .delete()
    .eq('id', groupId);

  if (error) {
    throw new Error(safeError(error, 'فشل حذف المجموعة.'));
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
  await assertAdmin();
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
  if (usersResult.error) errors.push(safeError(usersResult.error, 'users'));
  if (coursesResult.error) errors.push(safeError(coursesResult.error, 'courses'));
  if (groupsResult.error) errors.push(safeError(groupsResult.error, 'groups'));
  if (newUsersResult.error) errors.push(safeError(newUsersResult.error, 'newUsers'));
  if (prevUsersResult.error) errors.push(safeError(prevUsersResult.error, 'prevUsers'));
  if (prevCoursesResult.error) errors.push(safeError(prevCoursesResult.error, 'prevCourses'));
  if (prevGroupsResult.error) errors.push(safeError(prevGroupsResult.error, 'prevGroups'));
  if (prevNewUsersResult.error) errors.push(safeError(prevNewUsersResult.error, 'prevNewUsers'));

  if (errors.length > 0) {
    throw new Error(`فشل تحميل الإحصائيات: ${errors.join('؛ ')}`);
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
  await assertAdmin();
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'app_config')
    .maybeSingle();

  if (error) {
    throw new Error(safeError(error, 'فشل تحميل الإعدادات.'));
  }

  if (!data) {
    return DEFAULT_SETTINGS;
  }

  const stored = (data.value ?? {}) as Record<string, unknown>;
  return {
    siteName: (stored.site_name as string) ?? DEFAULT_SETTINGS.siteName,
    siteDescription: (stored.site_description as string) ?? DEFAULT_SETTINGS.siteDescription,
    defaultTheme: ((stored.default_theme as string) ?? DEFAULT_SETTINGS.defaultTheme) as AppSettings['defaultTheme'],
    allowNewRegistrations: (stored.allow_new_registrations as boolean) ?? DEFAULT_SETTINGS.allowNewRegistrations,
    maintenanceMode: (stored.maintenance_mode as boolean) ?? DEFAULT_SETTINGS.maintenanceMode,
  };
}

export async function updateSettings(payload: SettingsUpdatePayload): Promise<AppSettings> {
  await assertAdmin();
  const settingsValue: Record<string, unknown> = {};
  if (payload.siteName !== undefined) settingsValue.site_name = payload.siteName;
  if (payload.siteDescription !== undefined) settingsValue.site_description = payload.siteDescription;
  if (payload.defaultTheme !== undefined) settingsValue.default_theme = payload.defaultTheme;
  if (payload.allowNewRegistrations !== undefined) settingsValue.allow_new_registrations = payload.allowNewRegistrations;
  if (payload.maintenanceMode !== undefined) settingsValue.maintenance_mode = payload.maintenanceMode;

  const { data, error } = await supabase
    .from('settings')
    .upsert({
      key: 'app_config',
      value: settingsValue,
      updated_at: new Date().toISOString(),
    })
    .select('value')
    .single();

  if (error) {
    throw new Error(safeError(error, 'فشل تحديث الإعدادات.'));
  }

  const stored = (data?.value ?? {}) as Record<string, unknown>;
  return {
    siteName: (stored.site_name as string) ?? DEFAULT_SETTINGS.siteName,
    siteDescription: (stored.site_description as string) ?? DEFAULT_SETTINGS.siteDescription,
    defaultTheme: ((stored.default_theme as string) ?? DEFAULT_SETTINGS.defaultTheme) as AppSettings['defaultTheme'],
    allowNewRegistrations: (stored.allow_new_registrations as boolean) ?? DEFAULT_SETTINGS.allowNewRegistrations,
    maintenanceMode: (stored.maintenance_mode as boolean) ?? DEFAULT_SETTINGS.maintenanceMode,
  };
}

export async function testSupabaseConnection(): Promise<ConnectionTestResult> {
  await assertAdmin();
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

export async function reauth(password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({
    email: (await supabase.auth.getUser()).data.user?.email ?? '',
    password,
  });
  if (error) {
    throw new Error('كلمة المرور غير صحيحة');
  }
}

export async function deleteCourseSecure(courseId: string, password: string): Promise<void> {
  await reauth(password);
  return deleteCourse(courseId);
}

export async function deleteGroupSecure(groupId: string, password: string): Promise<void> {
  await reauth(password);
  return deleteGroup(groupId);
}

export async function setUserActiveSecure(userId: string, isActive: boolean, password: string): Promise<User> {
  await reauth(password);
  return setUserActive(userId, isActive);
}

export async function updateUserRoleSecure(userId: string, role: boolean, password: string): Promise<User> {
  await reauth(password);
  return updateUserRole(userId, role);
}

export async function resetAllDataSecure(password: string, confirmName: string): Promise<void> {
  await reauth(password);
  return (async () => {
    const { error: auditErr } = await supabase
      .from('admin_audit_log')
      .insert({
        action: 'resetAllData',
        payload: { confirmName },
        created_at: new Date().toISOString(),
      });
    if (auditErr) throw auditErr;

    const { error: groupsErr } = await supabase
      .from('study_groups')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (groupsErr) throw groupsErr;
    const { error: coursesErr } = await supabase
      .from('courses')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (coursesErr) throw coursesErr;
  })();
}
