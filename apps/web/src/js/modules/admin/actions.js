import { showToast } from '../shared.js';

export async function makeAdmin(db, userId) {
  if (!confirm('هل تريد تعيين هذا المستخدم كمشرف؟')) return;
  try {
    const result = await db.from('users').update({ is_admin: true }).eq('id', userId);
    if (result.error) throw result.error;
    showToast('تم تعيين المشرف بنجاح', 'success');
    await loadUsers(db);
  } catch (e) {
    showToast('فشل: ' + (e.message || ''), 'error');
  }
}

export async function revokeAdmin(db, userId) {
  const currentUser = window.getCurrentUser?.();
  if (currentUser?.id === userId) {
    showToast('لا يمكنك إلغاء صلاحياتك الخاصة', 'error');
    return;
  }
  if (!confirm('هل تريد إلغاء صلاحيات المشرف؟')) return;
  try {
    const result = await db.from('users').update({ is_admin: false }).eq('id', userId);
    if (result.error) throw result.error;
    showToast('تم إلغاء صلاحيات المشرف', 'success');
    await loadUsers(db);
  } catch (e) {
    showToast('فشل: ' + (e.message || ''), 'error');
  }
}

export async function toggleActive(db, userId, active) {
  const currentUser = window.getCurrentUser?.();
  if (currentUser?.id === userId && !active) {
    showToast('لا يمكنك تعطيل حسابك الخاص', 'error');
    return;
  }
  const msg = active ? 'هل تريد تفعيل هذا الحساب؟' : 'هل تريد تعطيل هذا الحساب؟ لن يتمكن المستخدم من تسجيل الدخول.';
  if (!confirm(msg)) return;
  try {
    const result = await db.from('users').update({ is_active: active }).eq('id', userId);
    if (result.error) throw result.error;
    showToast(active ? 'تم تفعيل الحساب' : 'تم تعطيل الحساب', 'success');
    await loadUsers(db);
    await loadStats(db);
  } catch (e) {
    showToast('فشل: ' + (e.message || ''), 'error');
  }
}

export async function deleteGroup(db, groupId) {
  if (!confirm('هل أنت متأكد من حذف هذه المجموعة؟ سيتم حذف جميع الأعضاء أيضاً.')) return;
  try {
    await db.from('group_members').delete().eq('group_id', groupId);
    const result = await db.from('groups').delete().eq('id', groupId);
    if (result.error) throw result.error;
    showToast('تم حذف المجموعة بنجاح', 'success');
    await loadGroups(db);
    await loadStats(db);
  } catch (e) {
    showToast('فشل: ' + (e.message || ''), 'error');
  }
}
