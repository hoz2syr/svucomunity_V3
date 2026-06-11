/**
 * ════════════════════════════════════════════════════════════════
 * SVU Community — Admin Panel
 * ════════════════════════════════════════════════════════════════
 */

import { safeStorageGet, safeStorageSet, safeStorageRemove } from './core.js';
import { t } from './i18n.js';
import { isEmailConfigured } from './email.js';

// ════════════════════════════════════════════════════════════════
// DOM refs set during init
// ════════════════════════════════════════════════════════════════

let db = null;
let allUsers = [];
let allGroups = [];
let currentTab = 'users';

// ════════════════════════════════════════════════════════════════
// Auth & Admin Check
// ════════════════════════════════════════════════════════════════

async function checkAdminAccess() {
  if (!window.isLoggedIn?.()) {
    window.location.href = 'login.html';
    return false;
  }

  db = window.initSupabase?.() ?? window.getDb?.();
  if (!db) {
    showAccessDenied();
    return false;
  }

  const isValid = await window.verifySessionWithServer?.(db) ?? true;
  if (!isValid) {
    window.location.href = 'login.html';
    return false;
  }

  const user = window.getCurrentUser?.();
  if (!user?.id) {
    showAccessDenied();
    return false;
  }

  try {
    const result = await db
      .from('users')
      .select('is_admin, is_active')
      .eq('id', user.id)
      .single();

    if (!result.data?.is_admin || !result.data.is_active) {
      showAccessDenied();
      return false;
    }
    return true;
  } catch (e) {
    showAccessDenied();
    return false;
  }
}

function showAccessDenied() {
  document.getElementById('loadingState')?.classList.add('hidden');
  document.getElementById('accessDenied')?.classList.remove('hidden');
}

// ════════════════════════════════════════════════════════════════
// Stats
// ════════════════════════════════════════════════════════════════

async function loadStats() {
  try {
    const result = await db.rpc('get_admin_stats');
    if (result.data?.length) {
      const stats = result.data[0];
      document.getElementById('statUsers').textContent = stats.total_users ?? 0;
      document.getElementById('statActive').textContent = stats.active_users ?? 0;
      document.getElementById('statGroups').textContent = stats.total_groups ?? 0;
      document.getElementById('statMembers').textContent = stats.total_memberships ?? 0;
      return;
    }
  } catch (e) {
    // fallback: manual count
  }

  try {
    const usersCount = await db.from('users').select('*', { count: 'exact', head: true });
    const groupsCount = await db.from('groups').select('*', { count: 'exact', head: true });
    const membersCount = await db.from('group_members').select('*', { count: 'exact', head: true });
    document.getElementById('statUsers').textContent = usersCount.count ?? 0;
    document.getElementById('statActive').textContent = '-';
    document.getElementById('statGroups').textContent = groupsCount.count ?? 0;
    document.getElementById('statMembers').textContent = membersCount.count ?? 0;
  } catch (e) {
    // ignore fallback errors
  }
}

// ════════════════════════════════════════════════════════════════
// Users
// ════════════════════════════════════════════════════════════════

async function loadUsers() {
  try {
    const result = await db
      .from('users')
      .select('id, username, first_name, middle_name, last_name, email, major, is_admin, is_active, created_at')
      .order('created_at', { ascending: false });

    if (result.error) throw result.error;
    allUsers = result.data || [];
    renderUsers(allUsers);
  } catch (e) {
    showToast('فشل تحميل المستخدمين: ' + (e.message || ''), 'error');
  }
}

function renderUsers(users) {
  const tbody = document.getElementById('usersTableBody');
  const empty = document.getElementById('usersEmpty');

  if (!users.length) {
    tbody.innerHTML = '';
    empty?.classList.remove('hidden');
    return;
  }
  empty?.classList.add('hidden');

  tbody.innerHTML = users.map(u => {
    const fullName = ((u.first_name || '') + ' ' + (u.middle_name || '') + ' ' + (u.last_name || '')).trim() || '-';
    const statusBadge = u.is_active
      ? '<span class="badge badge-active">نشط</span>'
      : '<span class="badge badge-inactive">معطل</span>';
    const adminBadge = u.is_admin
      ? '<span class="badge badge-admin">مشرف</span>'
      : '<span class="badge" style="background:rgba(100,116,139,0.15);color:#94a3b8">مستخدم</span>';
    const date = u.created_at ? new Date(u.created_at).toLocaleDateString('ar') : '-';

    return '<tr>'
      + '<td class="text-white font-medium">' + escapeHtml(fullName) + '</td>'
      + '<td class="text-secondary-300 text-sm">' + escapeHtml(u.email || '-') + '</td>'
      + '<td class="text-secondary-400 text-sm">@' + escapeHtml(u.username || '-') + '</td>'
      + '<td class="text-secondary-400 text-sm">' + escapeHtml(u.major || '-') + '</td>'
      + '<td>' + statusBadge + '</td>'
      + '<td>' + adminBadge + '</td>'
      + '<td class="text-secondary-500 text-sm">' + date + '</td>'
      + '<td class="flex gap-1 flex-wrap" data-actions="user" data-id="' + escapeHtml(u.id) + '">'
      + (u.is_admin
          ? '<button class="action-btn btn-warning" data-action="revokeAdmin">إلغاء إشراف</button>'
          : '<button class="action-btn btn-success" data-action="makeAdmin">تعيين مشرف</button>')
      + (u.is_active
          ? '<button class="action-btn btn-danger" data-action="toggleActive" data-active="false">تعطيل</button>'
          : '<button class="action-btn btn-success" data-action="toggleActive" data-active="true">تفعيل</button>')
      + '</td></tr>';
  }).join('');
}

// ════════════════════════════════════════════════════════════════
// Groups
// ════════════════════════════════════════════════════════════════

async function loadGroups() {
  try {
    const result = await db
      .from('groups')
      .select('*')
      .order('created_at', { ascending: false });

    if (result.error) throw result.error;
    allGroups = result.data || [];

    await window.enrichCreators?.(allGroups, db);
    renderGroups(allGroups);
  } catch (e) {
    showToast('فشل تحميل المجموعات: ' + (e.message || ''), 'error');
  }
}

function renderGroups(groups) {
  const tbody = document.getElementById('groupsTableBody');
  const empty = document.getElementById('groupsEmpty');

  if (!groups.length) {
    tbody.innerHTML = '';
    empty?.classList.remove('hidden');
    return;
  }
  empty?.classList.add('hidden');

  tbody.innerHTML = groups.map(g => {
    const isFull = (g.current_members || 0) >= (g.max_members || 0);
    const statusBadge = isFull
      ? '<span class="badge badge-full">ممتلئة</span>'
      : '<span class="badge badge-available">متاحة</span>';
    const date = g.created_at ? new Date(g.created_at).toLocaleDateString('ar') : '-';

    return '<tr>'
      + '<td class="text-white font-medium">' + escapeHtml(g.name || '-') + '</td>'
      + '<td class="text-secondary-300 text-sm">' + escapeHtml(g.course_name || '-') + '</td>'
      + '<td class="text-secondary-400 text-sm">' + escapeHtml(g.course_code || '-') + '</td>'
      + '<td class="text-secondary-400 text-sm">' + escapeHtml(g.major || '-') + '</td>'
      + '<td class="text-white text-sm">' + (g.current_members || 0) + '/' + (g.max_members || 0) + '</td>'
      + '<td>' + statusBadge + '</td>'
      + '<td class="text-secondary-400 text-sm">' + escapeHtml(g._creatorName || '-') + '</td>'
      + '<td class="text-secondary-500 text-sm">' + date + '</td>'
      + '<td><button class="action-btn btn-danger" data-action="deleteGroup" data-id="' + escapeHtml(g.id) + '">حذف</button></td>'
      + '</tr>';
  }).join('');
}

// ════════════════════════════════════════════════════════════════
// Admin Actions
// ════════════════════════════════════════════════════════════════

async function makeAdmin(userId) {
  if (!confirm('هل تريد تعيين هذا المستخدم كمشرف؟')) return;
  try {
    const result = await db.from('users').update({ is_admin: true }).eq('id', userId);
    if (result.error) throw result.error;
    showToast('تم تعيين المشرف بنجاح', 'success');
    await loadUsers();
  } catch (e) {
    showToast('فشل: ' + (e.message || ''), 'error');
  }
}

async function revokeAdmin(userId) {
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
    await loadUsers();
  } catch (e) {
    showToast('فشل: ' + (e.message || ''), 'error');
  }
}

async function toggleActive(userId, active) {
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
    await loadUsers();
    await loadStats();
  } catch (e) {
    showToast('فشل: ' + (e.message || ''), 'error');
  }
}

async function deleteGroup(groupId) {
  if (!confirm('هل أنت متأكد من حذف هذه المجموعة؟ سيتم حذف جميع الأعضاء أيضاً.')) return;
  try {
    await db.from('group_members').delete().eq('group_id', groupId);
    const result = await db.from('groups').delete().eq('id', groupId);
    if (result.error) throw result.error;
    showToast('تم حذف المجموعة بنجاح', 'success');
    await loadGroups();
    await loadStats();
  } catch (e) {
    showToast('فشل: ' + (e.message || ''), 'error');
  }
}

// ════════════════════════════════════════════════════════════════
// Event delegation — replaces inline onclick
// ════════════════════════════════════════════════════════════════

function onActionClick(action, btn) {
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

function setupActionDelegation() {
  document.body.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    if (!action) return;
    e.preventDefault();
    onActionClick(action, btn);
  });
}

// ════════════════════════════════════════════════════════════════
// Search & Filter
// ════════════════════════════════════════════════════════════════

function filterUsers() {
  const search = (document.getElementById('searchUsers')?.value || '').toLowerCase();
  const adminFilter = document.getElementById('filterAdmin')?.value || '';
  const activeFilter = document.getElementById('filterActive')?.value || '';

  const filtered = allUsers.filter(u => {
    const fullName = ((u.first_name || '') + ' ' + (u.last_name || '')).toLowerCase();
    if (search && !fullName.includes(search) && !(u.email || '').toLowerCase().includes(search) && !(u.username || '').toLowerCase().includes(search)) {
      return false;
    }
    if (adminFilter === 'admin' && !u.is_admin) return false;
    if (adminFilter === 'user' && u.is_admin) return false;
    if (activeFilter === 'active' && !u.is_active) return false;
    if (activeFilter === 'inactive' && u.is_active) return false;
    return true;
  });
  renderUsers(filtered);
}

function filterGroups() {
  const search = (document.getElementById('searchGroups')?.value || '').toLowerCase();
  const fullFilter = document.getElementById('filterFull')?.value || '';

  const filtered = allGroups.filter(g => {
    if (search && !(g.name || '').toLowerCase().includes(search) && !(g.course_name || '').toLowerCase().includes(search) && !(g.course_code || '').toLowerCase().includes(search)) {
      return false;
    }
    const isFull = (g.current_members || 0) >= (g.max_members || 0);
    if (fullFilter === 'available' && isFull) return false;
    if (fullFilter === 'full' && !isFull) return false;
    return true;
  });
  renderGroups(filtered);
}

// ════════════════════════════════════════════════════════════════
// Tabs
// ════════════════════════════════════════════════════════════════

function setupTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
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

      if (tab === 'groups' && !allGroups.length) loadGroups();
    });
  });
}

// ════════════════════════════════════════════════════════════════
// Email
// ════════════════════════════════════════════════════════════════

function setupEmailListeners() {
  const emailRecipientsEl = document.getElementById('emailRecipients');
  if (emailRecipientsEl) {
    emailRecipientsEl.addEventListener('change', () => {
      const wrapper = document.getElementById('customEmailsWrapper');
      wrapper?.classList.toggle('hidden', emailRecipientsEl.value !== 'custom');
    });
  }
}

function previewEmail() {
  const html = document.getElementById('emailBody')?.value || '';
  const preview = document.getElementById('emailPreview');
  if (!html.trim()) {
    preview?.classList.add('hidden');
    return;
  }
  preview.innerHTML = html;
  preview?.classList.remove('hidden');
}

async function sendAdminEmail() {
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
      const errors = (result?.errors || []).map(err => {
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

// ════════════════════════════════════════════════════════════════
// Public API (for backward-compat window assignments)
// ════════════════════════════════════════════════════════════════

export {
  checkAdminAccess,
  loadStats,
  loadUsers,
  loadGroups,
  makeAdmin,
  revokeAdmin,
  toggleActive,
  deleteGroup,
  filterUsers,
  filterGroups,
  setupTabs,
  setupEmailListeners,
  previewEmail,
  sendAdminEmail,
  setupActionDelegation,
};

window.adminPanel = {
  checkAdminAccess,
  loadStats,
  loadUsers,
  loadGroups,
  makeAdmin,
  revokeAdmin,
  toggleActive,
  deleteGroup,
  filterUsers,
  filterGroups,
  setupTabs,
  setupEmailListeners,
  previewEmail,
  sendAdminEmail,
};
