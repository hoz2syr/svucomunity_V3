/**
 * SVU Community - Core module
 * Handles theme management, session state, and shared utility functions.
 */

import {
  verifySessionWithServer,
  AUTH_CONFIG as _AUTH_CONFIG,
  THEME_CONFIG as _THEME_CONFIG,
} from './config.js';
import { storageSet, storageGet, storageRemove } from './encrypted-storage.js';
import { getCsrfToken, applyCsrfToSupabase, validateCsrfFromEvent } from './csrf.js';

let Sentry = null;
try {
  Sentry = await import('@sentry/browser');
} catch {
  // @sentry/browser not installed; using fallback error handler
}

const SENSITIVE_HEADER_KEYS = new Set([
  'email',
  'password',
  'csrf_token',
  'token',
  'secret',
  'apikey',
  'authorization',
  'set-cookie',
  'cookie',
]);

if (Sentry) {
  const SENTRY_DSN = import.meta.env?.VITE_SENTRY_DSN;
  if (SENTRY_DSN) {
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: import.meta.env?.VITE_SVU_DEBUG ? 'development' : 'production',
      tracesSampleRate: 0.1,
      beforeSend(event, hint) {
        const walk = (obj) => {
          if (!obj || typeof obj !== 'object') return;
          for (const key of Object.keys(obj)) {
            if (SENSITIVE_HEADER_KEYS.has(key.toLowerCase())) {
              obj[key] = '[REDACTED]';
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
              walk(obj[key]);
            }
          }
        };
        walk(event);
        walk(event.request);
        walk(event.request?.body);
        walk(event.request?.headers);
        walk(event.extra);
        if (event.user && typeof event.user === 'object') {
          delete event.user.email;
          delete event.user.ip_address;
          delete event.user.id;
        }
        return event;
      },
    });
    window.__svuSentryAvailable = true;
  } else {
    window.__svuSentryAvailable = false;
  }
} else {
  window.__svuSentryAvailable = false;
}

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

export { storageSet, storageGet, storageRemove };

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
    const { data: profileData, error } = await db
      .from('users')
      .select('id, username, email, first_name, middle_name, last_name, major, avatar_url, is_admin, is_active')
      .eq('id', user.id)
      .single();

    if (error || !profileData) {
      return null;
    }

    if (profileData.is_active === false) {
      return null;
    }

    cachedUser = {
      id: user.id,
      username: profileData.username || user.email?.split('@')[0] || '',
      email: profileData.email || user.email || '',
      first_name: profileData.first_name || '',
      middle_name: profileData.middle_name || '',
      last_name: profileData.last_name || '',
      major: profileData.major || '',
      avatar_url: profileData.avatar_url || '',
      is_admin: profileData.is_admin || false,
      is_active: profileData.is_active ?? true,
    };
    return cachedUser;
  } catch {
    return null;
  }
}

export function saveUserSession(userData) {
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
    return storageGet(key);
  } catch {
    return null;
  }
}

function safeStorageSet(key, value) {
  try {
    storageSet(key, value);
  } catch {
    // storage unavailable
  }
}

function safeStorageRemove(key) {
  try {
    storageRemove(key);
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
  return 'فشل إنشاء الحساب. يرجى التحقق من البيانات والمحاولة مرة أخرى.';
}

/**
 * Map login error keys to user-facing messages.
 * @param {Error} error
 * @returns {string}
 */
function handleLoginError(error) {
  const msg = error?.message || '';
  return 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
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
  const stored = getStoredTheme();
  const needsChange = stored !== theme;

  if (needsChange) {
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
    dispatchEvent(new CustomEvent('svu-theme-change', { detail: { theme } }));
  }

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
  validateCsrfFromEvent,
};
