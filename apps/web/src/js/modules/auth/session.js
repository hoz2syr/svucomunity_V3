/**
 * SVU Community — Session helpers
 * Uses localStorage via core.js wrappers (no direct storage calls here).
 */

import { safeStorageGet, safeStorageSet, safeStorageRemove, escapeHtml } from '../core.js';

export function getSession() {
  const token = safeStorageGet('svu_session_token');
  return token ? String(token).trim() : null;
}

export function setSession(token) {
  if (!token || typeof token !== 'string') throw new Error('Invalid token');
  safeStorageSet('svu_session_token', String(token).trim());
}

export function clearSession() {
  safeStorageRemove('svu_session_token');
}
