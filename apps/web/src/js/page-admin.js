import {
  checkAdminAccess,
  loadStats,
  loadUsers,
  loadGroups,
  setupTabs,
  setupSearchFilters,
  setupEmailListeners,
  setupActionDelegation,
  setupSettingsListeners,
} from './modules/admin.js';

async function init() {
  const passed = await checkAdminAccess();
  if (!passed) return;

  const db = window.getDb?.();
  if (!db) {
    showToast('تعذر الاتصال بقاعدة البيانات', 'error');
    return;
  }

  setupTabs();
  setupActionDelegation();
  setupSearchFilters();
  setupEmailListeners();
  setupSettingsListeners(db);

  await Promise.all([
    loadStats(db),
    loadUsers(db),
    loadGroups(db),
  ]);
}

init();
