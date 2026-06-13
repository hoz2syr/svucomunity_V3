import {
  makeAdmin,
  revokeAdmin,
  toggleActive,
  deleteGroup,
  sendAdminEmail,
} from './adminApi.js';
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
      makeAdmin(id);
      break;
    case 'revokeAdmin':
      revokeAdmin(id);
      break;
    case 'toggleActive': {
      const active = btn.dataset.active === 'true';
      toggleActive(id, active);
      break;
    }
    case 'deleteGroup':
      deleteGroup(id);
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
  const raw = document.getElementById('emailBody')?.value || '';
  const preview = document.getElementById('emailPreview');
  if (!preview) return;

  if (!raw.trim()) {
    preview.classList.add('hidden');
    return;
  }

  preview.classList.remove('hidden');
  preview.textContent = raw;
}

export async function sendAdminEmailFromForm() {
  const subject = document.getElementById('emailSubject')?.value.trim() || '';
  const body = document.getElementById('emailBody')?.value.trim() || '';
  const recipientsType = document.getElementById('emailRecipients')?.value || '';
  const customEmails = document.getElementById('customEmails')?.value.trim() || '';
  const sendBtn = document.getElementById('sendEmailBtn');
  const statusEl = document.getElementById('emailStatus');

  sendBtn.disabled = true;
  sendBtn.textContent = 'جاري الإرسال...';
  if (statusEl) statusEl.textContent = '';

  await sendAdminEmail(recipientsType, subject, body, customEmails);

  sendBtn.disabled = false;
  sendBtn.textContent = 'إرسال الإيميل';
}
