export { checkAdminAccess, showAccessDenied } from './auth.js';
export { loadStats } from './stats.js';
export { loadUsers, renderUsers, filterUsers } from './users.js';
export { loadGroups, renderGroups, filterGroups } from './groups.js';
export { makeAdmin, revokeAdmin, toggleActive, deleteGroup } from './actions.js';
export {
  onActionClick,
  setupActionDelegation,
  setupTabs,
  setupSearchFilters,
  setupEmailListeners,
  previewEmail,
  sendAdminEmail,
} from './events.js';

import { checkAdminAccess, showAccessDenied } from './auth.js';
import { loadStats } from './stats.js';
import { loadUsers } from './users.js';
import { loadGroups } from './groups.js';
import { makeAdmin, revokeAdmin, toggleActive, deleteGroup } from './actions.js';
import {
  onActionClick,
  setupActionDelegation,
  setupTabs,
  setupSearchFilters,
  setupEmailListeners,
  previewEmail,
  sendAdminEmail,
} from './events.js';
import * as actions from './actions.js';

window.adminPanel = {
  checkAdminAccess,
  loadStats,
  loadUsers,
  loadGroups,
  makeAdmin: actions.makeAdmin,
  revokeAdmin: actions.revokeAdmin,
  toggleActive: actions.toggleActive,
  deleteGroup: actions.deleteGroup,
  filterUsers,
  filterGroups,
  setupTabs,
  setupEmailListeners,
  previewEmail,
  sendAdminEmail,
};
