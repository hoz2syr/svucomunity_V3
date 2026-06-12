import { makeAdmin } from './actions.js';
import { revokeAdmin } from './actions.js';
import { toggleActive } from './actions.js';
import { deleteGroup } from './actions.js';
import { filterUsers } from './users.js';
import { filterGroups } from './groups.js';

export const db = null;
export let allUsers = [];
export let allGroups = [];
export let currentTab = 'users';

export function onActionClick(action, btn) {
  const id = btn.closest('[data-id]')?.dataset.id;
  if (!id) return;

  switch (action) {
    case 'makeAdmin':
      makeAdmin(db, id);
      break;
    case 'revokeAdmin':
      revokeAdmin(db, id);
      break;
    case 'toggleActive': {
      const active = btn.dataset.active === 'true';
      toggleActive(db, id, active);
      break;
    }
    case 'deleteGroup':
      deleteGroup(db, id);
      break;
  }
}

export function setupActionDelegation() {
  document.body.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    if (!action) return;
    e.preventDefault();
    onActionClick(action, btn);
  });
}

export function setupTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const tab = btn.dataset.tab;
      currentTab = tab;

      document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.remove('active');
        b.classList.add('text-secondary-400');
      });
      btn.classList.add('active');
      btn.classList.remove('text-secondary-400');

      document.getElementById('tab-users')?.classList.toggle('hidden', tab !== 'users');
      document.getElementById('tab-groups')?.classList.toggle('hidden', tab !== 'groups');
      document.getElementById('tab-email')?.classList.toggle('hidden', tab !== 'email');

      if (tab === 'groups' && !allGroups.length && db) {
        const groups = await window.loadGroups?.(db);
        if (groups) allGroups = groups;
      }
    });
  });
}

export function setupSearchFilters() {
  document.getElementById('searchUsers')?.addEventListener('input', () => filterUsers(allUsers));
  document.getElementById('filterAdmin')?.addEventListener('change', () => filterUsers(allUsers));
  document.getElementById('filterActive')?.addEventListener('change', () => filterUsers(allUsers));

  document.getElementById('searchGroups')?.addEventListener('input', () => filterGroups(allGroups));
  document.getElementById('filterFull')?.addEventListener('change', () => filterGroups(allGroups));
}

export function setupEmailListeners() {
  const emailRecipientsEl = document.getElementById('emailRecipients');
  if (emailRecipientsEl) {
    emailRecipientsEl.addEventListener('change', () => {
      const wrapper = document.getElementById('customEmailsWrapper');
      wrapper?.classList.toggle('hidden', emailRecipientsEl.value !== 'custom');
    });
  }
}

export function previewEmail() {
  const html = document.getElementById('emailBody')?.value || '';
  const preview = document.getElementById('emailPreview');
  if (!html.trim()) {
    preview?.classList.add('hidden');
    return;
  }
  preview.innerHTML = html;
  preview?.classList.remove('hidden');
}

export async function sendAdminEmail() {
  const subject = document.getElementById('emailSubject')?.value.trim() || '';
  const body = document.getElementById('emailBody')?.value.trim() || '';
  const recipientsType = document.getElementById('emailRecipients')?.value || '';
  const customEmails = document.getElementById('customEmails')?.value.trim() || '';
  const statusEl = document.getElementById('emailStatus');
  const sendBtn = document.getElementById('sendEmailBtn');

  if (!subject) {
    showToast('أدخل عنوان الإيميل', 'error');
    return;
  }
  if (!body) {
    showToast('أدخل محتوى الإيميل', 'error');
    return;
  }
  if (recipientsType === 'custom' && !customEmails) {
    showToast('أدخل عناوين الإيميل المخصصة', 'error');
    return;
  }
  if (!confirm('هل أنت متأكد من إرسال هذا الإيميل؟')) return;

  sendBtn.disabled = true;
  sendBtn.textContent = 'جاري الإرسال...';
  if (statusEl) statusEl.textContent = '';

  try {
    let result;
    if (recipientsType === 'all') {
      result = await window.emailService?.sendToAll(subject, body);
    } else {
      const emails = customEmails.split(',').map(e => e.trim()).filter(Boolean);
      result = await window.emailService?.sendBulk(emails, subject, body);
    }

    if (result && result.sent > 0) {
      showToast('تم إرسال الإيميل بنجاح', 'success');
      if (statusEl) {
        statusEl.textContent = 'تم الإرسال: ' + result.sent + ' | فشل: ' + result.failed;
        if (result.total) statusEl.textContent += ' (إجمالي: ' + result.total + ')';
      }
    } else {
      const errors = (result?.errors || []).map((err) => {
        return window.emailService?.getErrorMessage?.(err) || err;
      });
      showToast(errors[0] || 'فشل إرسال الإيميل', 'error');
      if (statusEl) statusEl.textContent = 'فشل: ' + errors.join(', ');
    }
  } catch (e) {
    showToast('خطأ: ' + (e.message || ''), 'error');
    if (statusEl) statusEl.textContent = 'خطأ: ' + (e.message || '');
  } finally {
    sendBtn.disabled = false;
    sendBtn.textContent = 'إرسال الإيميل';
  }
}
