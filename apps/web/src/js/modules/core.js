/**
 * SVU Community - Core module
 * Handles theme management, session state, and shared utility functions.
 */

import {
  verifySessionWithServer,
  AUTH_CONFIG as _AUTH_CONFIG,
  THEME_CONFIG as _THEME_CONFIG,
} from './config.js';

// Freeze configs to prevent accidental mutation
export const AUTH_CONFIG = Object.freeze({ ..._AUTH_CONFIG });
export const THEME_CONFIG = Object.freeze({ ..._THEME_CONFIG });

// ─── Safe storage wrappers ───────────────────────────────────────────────────

function safeStorageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeStorageSet(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function safeStorageRemove(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

// ─── Session management ──────────────────────────────────────────────────────

function getCurrentUser() {
  try {
    const str = safeStorageGet(AUTH_CONFIG.USER_KEY);
    return str ? JSON.parse(str) : null;
  } catch {
    return null;
  }
}

function saveUserSession(userData, rememberMe = false) {
  const payload = {
    user: userData,
    timestamp: Date.now(),
    rememberMe,
  };
  safeStorageSet(AUTH_CONFIG.STORAGE_KEY, JSON.stringify(payload));
  safeStorageSet(AUTH_CONFIG.SESSION_KEY, userData.id);
  safeStorageSet(AUTH_CONFIG.USER_KEY, JSON.stringify(userData));

  if (rememberMe) {
    const expires = new Date();
    expires.setDate(expires.getDate() + 30);
    safeStorageSet('session_expires', expires.getTime().toString());
  } else {
    safeStorageRemove('session_expires');
  }
}

function isLoggedIn() {
  const token = safeStorageGet(AUTH_CONFIG.SESSION_KEY);
  const data = safeStorageGet(AUTH_CONFIG.STORAGE_KEY);
  if (!token || !data) return false;

  try {
    const parsed = JSON.parse(data);
    if (!parsed.user) return false;

    const timeout = 30 * 60 * 1000;
    const rememberMe = !!parsed.rememberMe;

    if (rememberMe) {
      const expiresStr = safeStorageGet('session_expires');
      if (expiresStr && Date.now() > parseInt(expiresStr, 10)) {
        clearUserSession();
        return false;
      }
    } else {
      const ts = typeof parsed.timestamp === 'number' ? parsed.timestamp : 0;
      if (!ts || Date.now() - ts > timeout) {
        clearUserSession();
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

function clearUserSession() {
  safeStorageRemove(AUTH_CONFIG.STORAGE_KEY);
  safeStorageRemove(AUTH_CONFIG.SESSION_KEY);
  safeStorageRemove(AUTH_CONFIG.USER_KEY);
  safeStorageRemove('session_expires');
}

function updateUserData(updates) {
  const user = getCurrentUser();
  if (!user) return null;

  const updatedUser = { ...user, ...updates };
  safeStorageSet(AUTH_CONFIG.USER_KEY, JSON.stringify(updatedUser));

  const raw = safeStorageGet(AUTH_CONFIG.STORAGE_KEY);
  let sessionData = {};
  if (raw) {
    try {
      sessionData = JSON.parse(raw);
    } catch {
      // keep empty
    }
  }
  sessionData.user = updatedUser;
  safeStorageSet(AUTH_CONFIG.STORAGE_KEY, JSON.stringify(sessionData));

  return updatedUser;
}

// ─── Input validation ────────────────────────────────────────────────────────

/**
 * Validate login input and return array of error messages.
 * @param {string} identifier
 * @param {string} password
 * @returns {string[]}
 */
export function validateLoginInput(identifier, password) {
  const errors = [];
  if (!identifier?.trim()) {
    errors.push('identifier_required');
  }
  if (!password?.trim()) {
    errors.push('password_required');
  }
  if (password && password.length < 8) {
    errors.push('password_too_short');
  }
  return errors;
}

/**
 * Map internal error keys to user-facing messages.
 * @param {Error} error
 * @returns {string}
 */
export function handleLoginError(error) {
  const msg = error?.message || '';

  if (msg.includes('Invalid login credentials') || msg.includes('invalid_grant')) {
    return 'Invalid email or password';
  }
  if (msg.includes('Email not confirmed')) {
    return 'Please confirm your email first';
  }
  if (msg.includes('Too many requests')) {
    return 'Too many attempts. Please try again later.';
  }
  if (msg.includes('Network') || msg.includes('network')) {
    return 'Connection error. Please try again.';
  }
  if (msg.includes('User not found') || msg.includes('No user found')) {
    return 'Invalid email or password';
  }

  return 'An error occurred. Please try again.';
}

/**
 * Escape a string for safe insertion into HTML.
 * @param {string} text
 * @returns {string}
 */
export function escapeHtml(text) {
  if (typeof text !== 'string') return String(text);

  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };

  return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Validate and sanitize a URL string.
 * @param {string} url
 * @returns {string|null}
 */
export function validateUrl(url) {
  if (!url || typeof url !== 'string') return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.href;
    }
  } catch {
    // invalid URL
  }
  return null;
}

// ─── Theme management ────────────────────────────────────────────────────────

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function getStoredTheme() {
  return safeStorageGet(THEME_CONFIG.STORAGE_KEY);
}

function getCurrentEffectiveTheme() {
  const stored = getStoredTheme();
  if (!stored || stored === 'system') return getSystemTheme();
  return stored;
}

export function applyTheme(theme) {
  const root = document.documentElement;

  if (theme === 'system') {
    root.removeAttribute(THEME_CONFIG.LIGHT_ATTR);
    const sysTheme = getSystemTheme();
    root.classList.toggle(THEME_CONFIG.DARK_CLASS, sysTheme === 'dark');
  } else {
    root.setAttribute(THEME_CONFIG.LIGHT_ATTR, theme);
    root.classList.toggle(THEME_CONFIG.DARK_CLASS, theme === 'dark');
  }

  safeStorageSet(THEME_CONFIG.STORAGE_KEY, theme);
  updateThemeToggleIcon(theme);
}

function updateThemeToggleIcon(theme) {
  const btn = document.getElementById('themeToggleBtn');
  if (!btn) return;

  const sun = btn.querySelector('.icon-sun');
  const moon = btn.querySelector('.icon-moon');
  const system = btn.querySelector('.icon-system');

  if (sun) sun.classList.toggle('hidden', theme !== 'light');
  if (moon) moon.classList.toggle('hidden', theme !== 'dark');
  if (system) system.classList.toggle('hidden', theme !== 'system');

  btn.setAttribute(
    'aria-label',
    theme === 'light' ? 'Light mode - click for dark' : theme === 'dark' ? 'Dark mode - click for system' : 'System mode - click for light'
  );
}

export function initializeTheme() {
  const theme = getStoredTheme() || 'system';
  applyTheme(theme);

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const current = getStoredTheme();
    if (!current || current === 'system') {
      applyTheme('system');
    }
  });
}

export function toggleTheme() {
  const current = getStoredTheme() || 'system';
  const cycle = { light: 'dark', dark: 'system', system: 'light' };
  const next = cycle[current] || 'light';
  applyTheme(next);
  return next;
}

// ─── Exports ─────────────────────────────────────────────────────────────────

export {
  getCurrentUser,
  saveUserSession,
  isLoggedIn,
  clearUserSession,
  updateUserData,
  safeStorageGet,
  safeStorageSet,
  safeStorageRemove,
};
