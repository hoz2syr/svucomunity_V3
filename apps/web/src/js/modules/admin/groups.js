import { escapeHtml } from '../core.js';
import { showToast } from '../shared.js';

export async function loadGroups(db) {
  try {
    const result = await db
      .from('groups')
      .select('id, name, course_name, course_code, major, current_members, max_members, created_at')
      .order('created_at', { ascending: false });

    if (result.error) throw result.error;
    const allGroups = result.data || [];

    await window.enrichCreators?.(allGroups, db);
    renderGroups(allGroups);
    return allGroups;
  } catch (e) {
    showToast('فشل تحميل المجموعات: ' + (e.message || ''), 'error');
  }
}

export function renderGroups(groups) {
  const tbody = document.getElementById('groupsTableBody');
  const empty = document.getElementById('groupsEmpty');

  if (!groups.length) {
    tbody.innerHTML = '';
    empty?.classList.add('hidden');
    return;
  }
  empty?.classList.remove('hidden');

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

export function filterGroups(allGroups) {
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
