import { showToast } from '../shared.js';

const ADMIN_FN = 'admin-actions';

async function callAdmin(action, payload = {}) {
  const db = window.getDb?.();
  if (!db) {
    showToast('تعذر الاتصال بقاعدة البيانات', 'error');
    return { ok: false, error: new Error('no_db') };
  }

  const user = window.getCurrentUser?.();
  if (!user?.is_admin) {
    showToast('غير مصرح لك بهذا الإجراء', 'error');
    return { ok: false, error: new Error('forbidden') };
  }

  try {
    const { data, error } = await db.functions.invoke(ADMIN_FN, {
      body: { action, payload, caller_id: user.id },
    });
    if (error) throw error;
    return { ok: true, data };
  } catch (e) {
    showToast('فشل: ' + (e.message || ''), 'error');
    return { ok: false, error: e };
  }
}

export async function makeAdmin(userId) {
  if (!confirm('هل تريد تعيين هذا المستخدم كمشرف؟')) return;
  const result = await callAdmin('makeAdmin', { userId });
  if (result.ok) showToast('تم تعيين المشرف بنجاح', 'success');
}

export async function revokeAdmin(userId) {
  const currentUser = window.getCurrentUser?.();
  if (currentUser?.id === userId) {
    showToast('لا يمكنك إلغاء صلاحياتك الخاصة', 'error');
    return;
  }
  if (!confirm('هل تريد إلغاء صلاحيات المشرف؟')) return;
  const result = await callAdmin('revokeAdmin', { userId });
  if (result.ok) showToast('تم إلغاء صلاحيات المشرف', 'success');
}

export async function toggleActive(userId, active) {
  const currentUser = window.getCurrentUser?.();
  if (currentUser?.id === userId && !active) {
    showToast('لا يمكنك تعطيل حسابك الخاص', 'error');
    return;
  }
  const msg = active ? 'هل تريد تفعيل هذا الحساب؟' : 'هل تريد تعطيل هذا الحساب؟ لن يتمكن المستخدم من تسجيل الدخول.';
  if (!confirm(msg)) return;
  const result = await callAdmin('toggleActive', { userId, active });
  if (result.ok) showToast(active ? 'تم تفعيل الحساب' : 'تم تعطيل الحساب', 'success');
}

export async function deleteGroup(groupId) {
  if (!confirm('هل أنت متأكد من حذف هذه المجموعة؟ سيتم حذف جميع الأعضاء أيضاً.')) return;
  const result = await callAdmin('deleteGroup', { groupId });
  if (result.ok) showToast('تم حذف المجموعة بنجاح', 'success');
}

export async function sendAdminEmail(recipientsType, subject, body, customEmails) {
  if (!subject || !body) {
    showToast('أدخل عنوان ومحتوى الإيميل', 'error');
    return;
  }
  if (recipientsType === 'custom' && !customEmails?.trim()) {
    showToast('أدخل عناوين الإيميل المخصصة', 'error');
    return;
  }
  if (!confirm('هل أنت متأكد من إرسال هذا الإيميل؟')) return;

  const result = await callAdmin('sendEmail', {
    recipientsType,
    subject,
    body,
    customEmails: customEmails?.trim() || '',
  });

  if (result.ok) showToast('تم إرسال الإيميل بنجاح', 'success');
}
