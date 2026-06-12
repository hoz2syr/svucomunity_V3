import { escapeHtml } from '../core.js';
import { showToast } from '../shared.js';

export async function loadUsers(db) {
  try {
    const result = await db
      .from('users')
      .select('id, username, first_name, middle_name, last_name, email, major, is_admin, is_active, created_at')
      .order('created_at', { ascending: false });

    if (result.error) throw result.error;
    const allUsers = result.data || [];
    renderUsers(allUsers);
    return allUsers;
  } catch (e) {
    showToast('فشل تحميل المستخدمين: ' + (e.message || ''), 'error');
  }
}

export function renderUsers(users) {
  const tbody = document.getElementById('usersTableBody');
  const empty = document.getElementById('usersEmpty');

  if (!users.length) {
    tbody.innerHTML = '';
    empty?.classList.add('hidden');
    return;
  }
  empty?.classList.remove('hidden');

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

export function filterUsers(allUsers) {
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
