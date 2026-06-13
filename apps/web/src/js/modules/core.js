/**
 * SVU Community - Core module
 * Handles theme management, session state, and shared utility functions.
 */

import {
  verifySessionWithServer,
  AUTH_CONFIG as _AUTH_CONFIG,
  THEME_CONFIG as _THEME_CONFIG,
} from './config.js';
import { encryptedSet, encryptedGet, encryptedRemove } from './encrypted-storage.js';
import { getCsrfToken, getCsrfHeaderName, applyCsrfToSupabase, validateCsrfFromEvent } from './csrf.js';

let Sentry = null;
try {
  Sentry = await import('@sentry/browser');
} catch {
  // @sentry/browser not installed; using fallback error handler
}

if (Sentry) {
  Sentry.init({
    dsn: 'https://examplePublicKey@o12345.ingest.sentry.io/12345',
    environment: import.meta.env?.VITE_SVU_DEBUG ? 'development' : 'production',
    tracesSampleRate: 0.1,
    beforeSend(event, hint) {
      const sensitive = ['email', 'password', 'csrf_token', 'token', 'secret'];
      const walk = (obj) => {
        if (!obj || typeof obj !== 'object') return;
        for (const key of Object.keys(obj)) {
          if (sensitive.includes(key)) {
            obj[key] = '[REDACTED]';
          } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            walk(obj[key]);
          }
        }
      };
      walk(event.request?.data);
      walk(event.extra);
      if (event.user && typeof event.user === 'object') {
        delete event.user.email;
        delete event.user.ip_address;
      }
      return event;
    },
  });
}

window.__svuSentryAvailable = !!Sentry;

window.onerror = function (message, source, lineno, colno, error) {
  if (!window.__svuSentryAvailable) {
    console.error('[GlobalError]', message, source, lineno, colno, error);
  }
  if (typeof showToast === 'function') {
    showToast('An unexpected error occurred', 'error');
  }
};

window.addEventListener('unhandledrejection', function (event) {
  if (!window.__svuSentryAvailable) {
    console.error('[UnhandledRejection]', event.reason);
  }
});

export { encryptedSet, encryptedGet, encryptedRemove };

// Initialize CSRF protection for the current session
export function initializeCsrf(db) {
  getCsrfToken();
  if (db) applyCsrfToSupabase(db);
}

export const AUTH_CONFIG = Object.freeze({ ..._AUTH_CONFIG });
export const THEME_CONFIG = Object.freeze({ ..._THEME_CONFIG });

let cachedUser = null;

export function getCurrentUser() {
  return cachedUser;
}

export function cacheUser(userData) {
  cachedUser = userData || null;
}

export async function loadCurrentUser(db) {
  if (!db) db = window.getDb?.();
  if (!db) return null;
  try {
    const { data: { user } } = await db.auth.getUser();
    if (!user) return null;
    const { data: profileData } = await db
      .from('users')
      .select('id, username, email, first_name, middle_name, last_name, major, avatar_url, is_admin, is_active')
      .eq('id', user.id)
      .maybeSingle();
    cachedUser = {
      id: user.id,
      username: profileData?.username || user.email?.split('@')[0] || '',
      email: profileData?.email || user.email || '',
      first_name: profileData?.first_name || '',
      middle_name: profileData?.middle_name || '',
      last_name: profileData?.last_name || '',
      major: profileData?.major || '',
      avatar_url: profileData?.avatar_url || '',
      is_admin: profileData?.is_admin || false,
      is_active: profileData?.is_active ?? true,
    };
    return cachedUser;
  } catch {
    return null;
  }
}

export function saveUserSession(userData, rememberMe = false) {
  cacheUser(userData);
}

export function clearUserSession() {
  cachedUser = null;
}

export async function isLoggedIn(db) {
  if (!db) db = window.getDb?.();
  if (!db) return false;
  const { data: { user } } = await db.auth.getUser();
  return !!user;
}

export async function refreshUserState(db) {
  if (!db) db = window.getDb?.();
  if (!db) return null;
  const isValid = await verifySessionWithServer(db);
  if (!isValid) {
    clearUserSession();
    return null;
  }
  return loadCurrentUser(db);
}

function safeStorageGet(key) {
  try {
    return encryptedGet(key);
  } catch {
    return null;
  }
}

function safeStorageSet(key, value) {
  try {
    encryptedSet(key, value);
  } catch {
    // storage unavailable
  }
}

function safeStorageRemove(key) {
  try {
    encryptedRemove(key);
  } catch {
    // storage unavailable
  }
}

export function updateUserData(updates) {
  const user = getCurrentUser();
  if (!user) return null;
  const updatedUser = { ...user, ...updates };
  cacheUser(updatedUser);
  return updatedUser;
}

export async function verifySession(db) {
  if (!db) db = window.getDb?.();
  if (!db) return false;
  const { data: { user } } = await db.auth.getUser();
  return !!user;
}

// ─── Input validation ────────────────────────────────────────────────────────

/**
 * Validate login input and return array of error messages.
 * @param {string} identifier
 * @param {string} password
 * @returns {string[]}
 */
function validateLoginInput(identifier, password) {
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
 * Map registration error keys to user-facing messages.
 * @param {Error} error
 * @returns {string}
 */
function handleRegisterError(error) {
  const msg = error?.message || '';

  if (msg.includes('already registered') || msg.includes('already exists')) {
    return 'البريد الإلكتروني أو اسم المستخدم مسجّل مسبقاً';
  }
  if (msg.includes('Password should be at least')) {
    return 'كلمة المرور ضعيفة جداً';
  }
  if (msg.includes('Invalid email')) {
    return 'البريد الإلكتروني غير صالح';
  }
  if (msg.includes('Network') || msg.includes('network')) {
    return 'خطأ في الاتصال، يرجى المحاولة مرة أخرى';
  }
  if (msg.includes('Email not confirmed')) {
    return 'يرجى تفعيل بريدك الإلكتروني أولاً';
  }

  return 'فشل إنشاء الحساب. يرجى المحاولة مرة أخرى.';
}

/**
 * Map internal error keys to user-facing messages.
 * @param {Error} error
 * @returns {string}
 */
function handleLoginError(error) {
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
function escapeHtml(text) {
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
function validateUrl(url) {
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

function getStoredTheme() {
  return safeStorageGet(THEME_CONFIG.STORAGE_KEY);
}

function getCurrentEffectiveTheme() {
  const stored = getStoredTheme();
  if (!stored || stored === 'system') return getSystemTheme();
  return stored;
}

function applyTheme(theme) {
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
  dispatchEvent(new CustomEvent('svu-theme-change', { detail: { theme } }));
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

function initializeTheme() {
  const theme = getStoredTheme() || 'system';
  applyTheme(theme);

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const current = getStoredTheme();
    if (!current || current === 'system') {
      applyTheme('system');
    }
  });
}

function toggleTheme() {
  const current = getStoredTheme() || 'system';
  const cycle = { dark: 'light', light: 'system', system: 'dark' };
  const next = cycle[current] || 'dark';
  applyTheme(next);
  return next;
}

// ─── Exports ─────────────────────────────────────────────────────────────────

export {
  safeStorageGet,
  safeStorageSet,
  safeStorageRemove,
  escapeHtml,
  validateUrl,
  validateLoginInput,
  handleRegisterError,
  handleLoginError,
  initializeTheme,
  toggleTheme,
  getStoredTheme,
  applyTheme,
  getCsrfToken,
  getCsrfHeaderName,
  validateCsrfFromEvent,
};
