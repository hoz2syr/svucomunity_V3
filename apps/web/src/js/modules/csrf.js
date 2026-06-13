/**
 * SVU Community — CSRF protection
 *
 * Generates a per-session token, stores it in sessionStorage,
 * and exposes a helper to attach it to Supabase request globals.
 */

const CSRF_COOKIE_NAME = 'svu_csrf_token';
const CSRF_STORAGE_KEY = 'svu_csrf_token';

function generateToken() {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
}

export function getCsrfToken() {
  let token = sessionStorage.getItem(CSRF_STORAGE_KEY);
  if (!token) {
    token = generateToken();
    sessionStorage.setItem(CSRF_STORAGE_KEY, token);
    setCsrfCookie(token);
  }
  return token;
}

function setCsrfCookie(token) {
  const secure = window.location.protocol === 'https:';
  document.cookie = `${CSRF_COOKIE_NAME}=${token}; path=/; SameSite=Strict; ${secure ? 'Secure;' : ''} max-age=86400`;
}

export function getCsrfHeaderName() {
  return 'x-csrf-token';
}

export function applyCsrfToSupabase(db) {
  if (!db) return;
  try {
    const token = getCsrfToken();
    const originalFrom = db.from.bind(db);
    db.from = function (table) {
      const builder = originalFrom(table);
      if (builder && typeof builder.headers === 'function') {
        const origHeaders = builder.headers.bind(builder);
        builder.headers = function (extra) {
          return origHeaders({
            ...(extra || {}),
            [getCsrfHeaderName()]: token,
          });
        };
      }
      return builder;
    };
  } catch (e) {
    console.warn('[csrf] failed to attach header interceptor:', e);
  }
}

export function validateCsrfFromEvent(event) {
  const cookie = document.cookie
    .split('; ')
    .find(row => row.startsWith(CSRF_COOKIE_NAME + '='));
  const header = event.headers?.get?.(getCsrfHeaderName());
  return !!header && header === (cookie ? cookie.split('=')[1] : '');
}
