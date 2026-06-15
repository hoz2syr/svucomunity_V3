import { isLoggedIn, getCurrentUser, clearUserSession } from '../core.js';
import { initSupabase, getDb, verifySessionWithServer } from '../config.js';

export async function checkAdminAccess() {
  if (!(await isLoggedIn())) {
    window.location.href = 'login.html';
    return false;
  }

  const db = getDb() || initSupabase();
  if (!db) {
    showAccessDenied();
    return false;
  }

  const isValid = await verifySessionWithServer(db);
  if (!isValid) {
    window.location.href = 'login.html';
    return false;
  }

  const user = getCurrentUser();
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

  setTimeout(() => {
    window.location.href = 'index.html';
  }, 2000);
}
