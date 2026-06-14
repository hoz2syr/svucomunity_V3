import {
  makeAdmin,
  revokeAdmin,
  toggleActive,
  deleteGroup,
  sendAdminEmail,
} from './adminApi.js';
import { filterUsers } from './users.js';
import { filterGroups } from './groups.js';
import { filterCourses } from './courses.js';

export const db = null;
export let allUsers = [];
export let allGroups = [];
export let allCourses = [];
export let currentTab = 'overview';

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

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
    case 'deleteCourse':
      if (window.adminDeleteCourse) window.adminDeleteCourse(id);
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
  document.querySelectorAll('.admin-tab').forEach(btn => {
    btn.addEventListener('click', async () => {
      const tab = btn.dataset.adminTab;
      currentTab = tab;

      document.querySelectorAll('.admin-tab').forEach(b => {
        b.classList.remove('active', 'bg-primary-500/20', 'text-white');
        b.classList.add('text-secondary-300');
      });
      btn.classList.add('active', 'bg-primary-500/20', 'text-white');
      btn.classList.remove('text-secondary-300');

      const panels = ['overview', 'users', 'courses-admin', 'groups-admin', 'settings'];
      panels.forEach(p => {
        const el = document.getElementById('tab-' + p);
        if (el) el.classList.toggle('hidden', p !== tab);
      });

      if ((tab === 'groups-admin' || tab === 'courses-admin') && db) {
        if (tab === 'groups-admin' && !allGroups.length) {
          const groups = await window.loadGroups?.(db);
          if (groups) allGroups = groups;
        }
        if (tab === 'courses-admin' && !allCourses.length) {
          const courses = await window.loadCourses?.(db);
          if (courses) allCourses = courses;
        }
      }
    });
  });
}

const debouncedFilterUsers = debounce(() => filterUsers(allUsers), 250);
const debouncedFilterGroups = debounce(() => filterGroups(allGroups), 250);
const debouncedFilterCourses = debounce(() => filterCourses(allCourses), 250);

export function setupSearchFilters() {
  const userSearchEl = document.getElementById('userSearchInput');
  const userRoleEl = document.getElementById('userRoleFilter');
  if (userSearchEl) userSearchEl.addEventListener('input', debouncedFilterUsers);
  if (userRoleEl) userRoleEl.addEventListener('change', () => filterUsers(allUsers));

  const groupSearchEl = document.getElementById('searchGroups');
  const groupFilterEl = document.getElementById('filterFull');
  if (groupSearchEl) groupSearchEl.addEventListener('input', debouncedFilterGroups);
  if (groupFilterEl) groupFilterEl.addEventListener('change', () => filterGroups(allGroups));

  const courseSearchEl = document.getElementById('adminCourseSearch');
  if (courseSearchEl) courseSearchEl.addEventListener('input', debouncedFilterCourses);
}

export function setupEmailListeners() {
  const emailRecipientsEl = document.getElementById('emailRecipients');
  if (!emailRecipientsEl) return;
  emailRecipientsEl.addEventListener('change', () => {
    const wrapper = document.getElementById('customEmailsWrapper');
    wrapper?.classList.toggle('hidden', emailRecipientsEl.value !== 'custom');
  });
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
