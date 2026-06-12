/**
 * SVU Community — Auth Guard (Shared)
 */

import { isLoggedIn, getCurrentUser, clearUserSession } from '../core.js';
import { initSupabase, getDb, verifySessionWithServer } from '../config.js';

export async function checkAuth(options = {}) {
  const requireAdmin = options.requireAdmin || false;
  const silent = options.silent || false;

  const db = getDb() || initSupabase();
  if (!db) {
    if (!silent) window.location.href = 'login.html';
    return null;
  }

  const isValid = await verifySessionWithServer(db);
  if (!isValid) {
    if (!silent) window.location.href = 'login.html';
    return null;
  }

  const user = getCurrentUser();
  if (!user || !user.id) {
    if (!silent) window.location.href = 'login.html';
    return null;
  }

  if (requireAdmin) {
    try {
      const { data } = await db
        .from('users')
        .select('is_admin, is_active')
        .eq('id', user.id)
        .single();

      if (!data?.is_admin || !data?.is_active) {
        if (!silent) window.location.href = 'index.html';
        return null;
      }
    } catch (err) {
      console.error('[auth-guard] Admin check failed:', err);
      if (!silent) window.location.href = 'login.html';
      return null;
    }
  }

  return { user, db };
}

