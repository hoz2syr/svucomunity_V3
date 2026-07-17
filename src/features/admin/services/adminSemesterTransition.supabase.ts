import { hasSupabaseEnv, getSupabaseClient } from '@/src/lib/supabase';
import type { ServiceResult } from '@/src/types/admin';
import { ROLES } from '@/src/types/admin';
import { broadcastToAllUsers } from './adminNotificationService.supabase';

export async function confirmSemesterTransition(
  callerRole: string,
  callerId: string,
  nextSemester: string,
): Promise<ServiceResult<{ oldSemester: string; updatedCount: number; archivedCount: number }>> {
  if (callerRole !== ROLES.ADMIN) {
    return { data: null, error: new Error('Unauthorized') };
  }

  if (!hasSupabaseEnv()) {
    return { data: null, error: new Error('Supabase not configured') };
  }

  const client = await getSupabaseClient();

  const { data: currentProfile, error: profileError } = await client
    .from('profiles')
    .select('current_semester')
    .eq('id', callerId)
    .single();

  if (profileError) {
    return { data: null, error: new Error(profileError.message) };
  }

  const oldSemester = currentProfile?.current_semester ?? 'S25';

  if (nextSemester === oldSemester) {
    return { data: { oldSemester, updatedCount: 0, archivedCount: 0 }, error: null };
  }

  const { error: updateError } = await client
    .from('profiles')
    .update({ current_semester: nextSemester })
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (updateError) {
    return { data: null, error: new Error(updateError.message) };
  }

  const { data: archiveData, error: archiveError } = await client
    .from('groups')
    .update({ is_archived: true })
    .eq('semester_code', oldSemester)
    .select('id');

  if (archiveError) {
    return { data: null, error: new Error(archiveError.message) };
  }

  const archivedCount = archiveData?.length ?? 0;

  const { error: logError } = await client
    .from('admin_audit_log')
    .insert({
      caller_id: callerId,
      action: 'semester_transition',
      payload: { oldSemester, nextSemester, archivedCount },
    });

  if (logError) {
    return { data: null, error: new Error(logError.message) };
  }

  const broadcastResult = await broadcastToAllUsers(
    callerRole,
    callerId,
    {
      title: `تم الانتقال إلى الفصل ${nextSemester}`,
      body: `تم تحديث الفصل الدراسي إلى ${nextSemester}. المجموعات القديمة تم أرشفتها.`,
      priority: 'normal',
    },
  );

  if (broadcastResult.error) {
    return { data: null, error: broadcastResult.error };
  }

  return { data: { oldSemester, updatedCount: 0, archivedCount }, error: null };
}

export async function getCurrentSystemSemester(): Promise<ServiceResult<string>> {
  if (!hasSupabaseEnv()) {
    return { data: null, error: new Error('Supabase not configured') };
  }

  const client = await getSupabaseClient();

  const { data, error } = await client
    .from('profiles')
    .select('current_semester')
    .limit(1)
    .single();

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  return { data: data?.current_semester ?? 'S25', error: null };
}
