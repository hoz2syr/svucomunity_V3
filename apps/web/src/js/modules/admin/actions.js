import { makeAdmin as apiMakeAdmin, revokeAdmin as apiRevokeAdmin, toggleActive as apiToggleActive, deleteGroup as apiDeleteGroup } from './adminApi.js';
import { showToast } from '../shared.js';

export async function makeAdmin(db, userId) {
  const result = await apiMakeAdmin(userId);
  if (!result.ok) showToast('فشل: ' + (result.error?.message || ''), 'error');
}

export async function revokeAdmin(db, userId) {
  const currentUser = window.getCurrentUser?.();
  if (currentUser?.id === userId) {
    showToast('لا يمكنك إلغاء صلاحياتك الخاصة', 'error');
    return;
  }
  const result = await apiRevokeAdmin(userId);
  if (!result.ok) showToast('فشل: ' + (result.error?.message || ''), 'error');
}

export async function toggleActive(db, userId, active) {
  const currentUser = window.getCurrentUser?.();
  if (currentUser?.id === userId && !active) {
    showToast('لا يمكنك تعطيل حسابك الخاص', 'error');
    return;
  }
  const result = await apiToggleActive(userId, active);
  if (!result.ok) showToast('فشل: ' + (result.error?.message || ''), 'error');
}

export async function deleteGroup(db, groupId) {
  const result = await apiDeleteGroup(groupId);
  if (!result.ok) showToast('فشل: ' + (result.error?.message || ''), 'error');
}
