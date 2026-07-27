import { hasSupabaseEnv, getSupabaseClient } from '@/src/lib/supabase';
import type { ServiceResult } from '@/src/types/admin';
import { ROLES } from '@/src/types/admin';
import { broadcastToAllUsers } from './adminNotificationService.supabase';
import { getNextSemesterCode } from '@/src/features/schedule-extraction/utils/semesterUtils';

export async function confirmSemesterTransition(
  callerRole: string,
  callerId: string,
  targetSemester?: string,
): Promise<ServiceResult<{ oldSemester: string; nextSemester: string; updatedCount: number; archivedCount: number; warning?: string }>> {
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

  const oldSemester = currentProfile?.current_semester ?? getCurrentSystemSemesterFallback();
  const nextSemester = targetSemester && targetSemester.trim() !== '' ? targetSemester.trim() : getNextSemesterCode(oldSemester);

  if (nextSemester === oldSemester) {
    return { data: { oldSemester, nextSemester, updatedCount: 0, archivedCount: 0 }, error: null };
  }

  const { data: updateData, error: updateError } = await client
    .from('profiles')
    .update({ current_semester: nextSemester })
    .neq('current_semester', nextSemester)
    .neq('id', '00000000-0000-0000-0000-000000000000')
    .select('id');

  if (updateError) {
    return { data: null, error: new Error(updateError.message) };
  }

  const updatedCount = updateData?.length ?? 0;

  const { data: archiveData, error: archiveError } = await client
    .from('groups')
    .update({ is_archived: true, semester_code: nextSemester })
    .eq('semester_code', oldSemester)
    .select('id');

  if (archiveError) {
    await client
      .from('profiles')
      .update({ current_semester: oldSemester })
      .neq('id', '00000000-0000-0000-0000-000000000000');

    return { data: null, error: new Error(archiveError.message) };
  }

  const archivedCount = archiveData?.length ?? 0;

  const { error: logError } = await client
    .from('admin_audit_log')
    .insert({
      caller_id: callerId,
      action: 'semester_transition',
      payload: { oldSemester, nextSemester, updatedCount, archivedCount },
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
    console.warn('Semester transition broadcast failed:', broadcastResult.error);
    return {
      data: { oldSemester, nextSemester, updatedCount, archivedCount, warning: 'تم الانتقال بنجاح ولكن فشل إرسال الإشعارات للمستخدمين' },
      error: null,
    };
  }

  return { data: { oldSemester, nextSemester, updatedCount, archivedCount }, error: null };
}

function getCurrentSystemSemesterFallback(): string {
  return 'S25';
}

export async function getCurrentSystemSemester(): Promise<ServiceResult<string>> {
  if (!hasSupabaseEnv()) {
    return { data: null, error: new Error('Supabase not configured') };
  }

  const client = await getSupabaseClient();

  const { data, error } = await client
    .from('profiles')
    .select('current_semester')
    .not('current_semester', 'is', null);

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  if (!data || data.length === 0) {
    return { data: 'S25', error: null };
  }

  const semesterCounts = new Map<string, number>();
  for (const row of data) {
    const semester = row.current_semester as string;
    semesterCounts.set(semester, (semesterCounts.get(semester) || 0) + 1);
  }

  let mostCommon = 'S25';
  let maxCount = 0;
  for (const [semester, count] of semesterCounts) {
    if (count > maxCount) {
      maxCount = count;
      mostCommon = semester;
    }
  }

  return { data: mostCommon, error: null };
}
