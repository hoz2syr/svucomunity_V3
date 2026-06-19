/**
 * SVU Community — Auth Guard (Shared)
 */

import { isLoggedIn, getCurrentUser, clearUserSession } from '../core.js';
import { initSupabase, getDb, verifySessionWithServer, getConfigError } from '../config.js';
import { showToast } from '../shared.js';

const AUTH_REDIRECT = `${window.location.origin}/login.html`;
const UNAUTHORIZED_REDIRECT = `${window.location.origin}/index.html`;

function safeRedirect(target) {
  try {
    const url = new URL(target, window.location.origin);
    if (url.origin === window.location.origin) {
      window.location.href = target;
      return;
    }
  } catch {
    // invalid URL
  }
  window.location.href = AUTH_REDIRECT;
}

export async function checkAuth(options = {}) {
  const requireAdmin = options.requireAdmin || false;
  const silent = options.silent || false;

  const db = getDb();
  if (!db) {
    const cfgError = getConfigError();
    if (!silent) {
      console.error('[auth-guard] init failed:', cfgError?.message);
      showToast('تعذر الاتصال بالخادم. حاول مرة أخرى لاحقاً.', 'error');
      safeRedirect(AUTH_REDIRECT);
    }
    return null;
  }

  const isValid = await verifySessionWithServer(db);
  if (!isValid) {
    if (!silent) safeRedirect(AUTH_REDIRECT);
    return null;
  }

  const user = getCurrentUser();
  if (!user || !user.id) {
    if (!silent) safeRedirect(AUTH_REDIRECT);
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
        if (!silent) {
          showToast('ليس لديك صلاحية الوصول لهذه الصفحة.', 'error');
          safeRedirect(UNAUTHORIZED_REDIRECT);
        }
        return null;
      }
    } catch (err) {
      if (!silent) {
        if (import.meta.env?.DEV) {
          console.error('[auth-guard] Admin check failed:', err);
        }
        showToast('فشل التحقق من الصلاحيات. تواصل مع المشرف.', 'error');
        safeRedirect(UNAUTHORIZED_REDIRECT);
      }
      return null;
    }
  }

  return { user, db };
}


