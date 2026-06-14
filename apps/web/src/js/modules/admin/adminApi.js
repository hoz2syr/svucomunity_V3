import { escapeHtml } from '../core.js';
import { showToast } from '../shared.js';

const ADMIN_FN = 'admin-actions';
const EMAIL_SEPARATOR = /[,;\s]+/;

function isEmailAddress(value) {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function safeError(message) {
  if (!message || typeof message !== 'string') return 'فشلت العملية';
  const normalized = message.toLowerCase();
  if (/(pgrst|supabase|postgres|connect|timeout|unauthorized|forbidden)/.test(normalized)) {
    return 'فشلت العملية';
  }
  return message;
}

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
      body: { action, payload },
    });
    if (error) throw error;
    return { ok: true, data };
  } catch (e) {
    showToast('فشل: ' + safeError(e?.message || ''), 'error');
    console.error('[adminApi]', action, e);
    return { ok: false, error: e };
  }
}

function validateUserId(userId) {
  if (!userId || typeof userId !== 'string' || userId.length < 8 || userId.length > 36) return false;
  return /^[a-zA-Z0-9-]+$/.test(userId);
}

function validateGroupId(groupId) {
  if (!groupId || typeof groupId !== 'string' || groupId.length < 8 || groupId.length > 36) return false;
  return /^[a-zA-Z0-9-]+$/.test(groupId);
}

export async function makeAdmin(userId) {
  if (!validateUserId(userId)) {
    showToast('معرف المستخدم غير صالح', 'error');
    return;
  }
  if (!confirm('هل تريد تعيين هذا المستخدم كمشرف؟')) return;
  const result = await callAdmin('makeAdmin', { userId });
  if (result.ok) showToast('تم تعيين المشرف بنجاح', 'success');
}

export async function revokeAdmin(userId) {
  if (!validateUserId(userId)) {
    showToast('معرف المستخدم غير صالح', 'error');
    return;
  }
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
  if (!validateUserId(userId)) {
    showToast('معرف المستخدم غير صالح', 'error');
    return;
  }
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
  if (!validateGroupId(groupId)) {
    showToast('معرف المجموعة غير صالح', 'error');
    return;
  }
  if (!confirm('هل أنت متأكد من حذف هذه المجموعة؟ سيتم حذف جميع الأعضاء أيضاً.')) return;
  const result = await callAdmin('deleteGroup', { groupId });
  if (result.ok) showToast('تم حذف المجموعة بنجاح', 'success');
}

export async function sendAdminEmail(recipientsType, subject, body, customEmails) {
  if (!subject?.trim() || !body?.trim()) {
    showToast('أدخل عنوان ومحتوى الإيميل', 'error');
    return;
  }
  if (recipientsType === 'custom') {
    const emails = (customEmails || '')
      .split(EMAIL_SEPARATOR)
      .map(e => e.trim())
      .filter(e => e.length > 0);
    if (!emails.length || !emails.every(isEmailAddress)) {
      showToast('أدخل عناوين إيميل صالحة مفصولة بفواصل', 'error');
      return;
    }
  }
  if (!confirm('هل أنت متأكد من إرسال هذا الإيميل؟')) return;

  const result = await callAdmin('sendEmail', {
    recipientsType,
    subject: subject.trim(),
    body: body.trim(),
    customEmails: (customEmails || '').trim(),
  });

  if (result.ok) showToast('تم إرسال الإيميل بنجاح', 'success');
}
