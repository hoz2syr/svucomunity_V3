import {
  checkAdminAccess,
  showAccessDenied,
  loadStats,
  loadUsers,
  renderUsers,
  filterUsers,
  loadGroups,
  renderGroups,
  filterGroups,
  loadCourses,
  renderCourses,
  filterCourses,
  deleteCourse,
  onActionClick,
  setupActionDelegation,
  setupTabs,
  setupSearchFilters,
  setupEmailListeners,
  previewEmail,
  sendAdminEmailFromForm,
  makeAdmin,
  revokeAdmin,
  toggleActive,
  deleteGroup,
} from './admin/index.js';

async function init() {
  if (!checkAdminAccess()) {
    showAccessDenied();
    return;
  }

  await loadStats();
  await loadUsers();
  await loadGroups();
  await loadCourses();

  setupActionDelegation();
  setupTabs();
  setupSearchFilters();
  setupEmailListeners();
}

init();
