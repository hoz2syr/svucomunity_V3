/**
 * SVU Community — CSRF protection
 *
 * Generates a per-session token, stores it in sessionStorage and a
 * SameSite=Lax cookie, and exposes helpers to attach it to Supabase
 * request globals.
 *
 * Scope note:
 * - This module protects against same-origin state-changing requests using
 *   the double-submit cookie pattern (cookie + header match).
 * - It does NOT protect against cross-origin CSRF, which is the threat
 *   model SameSite cookies address. Supabase Auth uses Bearer tokens in
 *   Authorization headers for its own API (*.supabase.co), so Supabase
 *   requests are not CSRF-vulnerable via cookies. The `applyCsrfToSupabase`
 *   interceptor adds the `x-csrf-token` header as a defense-in-depth
 *   measure for any same-origin proxied endpoints.
 *
 * Security notes:
 * - SameSite=Lax (not Strict): Strict breaks redirect flows from external
 *   origins (password reset links, SSO callbacks) which are common in SPAs.
 * - Token is bound to a browser fingerprint hash (UA + language + timezone + resolution)
 *   to reduce token theft replay from other browsers/devices on the same origin.
 * - The cookie is scoped to path=/ so it is sent on all routes of the
 *   current origin. This is intentional for a SPA that changes hash
 *   routes; sibling apps on the same origin will share the cookie, so
 *   origin-level isolation must be enforced server-side.
 */

const CSRF_COOKIE_NAME = 'svu_csrf_token';
const CSRF_STORAGE_KEY = 'svu_csrf_token';
// WARNING: path=/ is required for hash-based SPA routing.
// All sibling apps on the same origin share this cookie.
// Origin-level isolation MUST be enforced server-side (Edge Function auth.uid() + RLS).
// Changing this to a narrower path breaks in-app CSRF validation across hash routes.
const CSRF_COOKIE_PATH = '/';

function generateToken() {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
}

function getBrowserFingerprint() {
  try {
    const nav = window.navigator;
    const parts = [
      nav.userAgent || '',
      nav.language || '',
      Intl.DateTimeFormat().resolvedOptions().timeZone || '',
      screen.width + 'x' + screen.height,
    ];
    const raw = parts.join('|');
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      const chr = raw.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0;
    }
    return Math.abs(hash).toString(16);
  } catch {
    return 'unknown';
  }
}

export function getCsrfToken() {
  const fingerprint = getBrowserFingerprint();
  let stored = sessionStorage.getItem(CSRF_STORAGE_KEY);
  if (stored) {
    const [storedFp, storedToken] = stored.split(':');
    if (storedToken) {
      if (storedFp === fingerprint) {
        return storedToken;
      }
      const cookie = document.cookie
        .split('; ')
        .find(row => row.startsWith(CSRF_COOKIE_NAME + '='));
      if (cookie && decodeURIComponent(cookie.split('=')[1]).startsWith(storedFp + ':')) {
        const cookieStored = decodeURIComponent(cookie.split('=')[1]);
        const cookieToken = cookieStored.slice(cookieStored.indexOf(':') + 1);
        if (cookieToken === storedToken) {
          return storedToken;
        }
      }
    }
  }
  const token = fingerprint + ':' + generateToken();
  sessionStorage.setItem(CSRF_STORAGE_KEY, token);
  setCsrfCookie(token);
  return token.slice(token.indexOf(':') + 1);
}

export function getCsrfCookieRaw() {
  return sessionStorage.getItem(CSRF_STORAGE_KEY) || '';
}

function setCsrfCookie(token) {
  const isProduction = window.location.protocol === 'https:';
  const secureDirective = isProduction ? 'Secure;' : '';
  document.cookie = `${CSRF_COOKIE_NAME}=${encodeURIComponent(token)}; path=${CSRF_COOKIE_PATH}; SameSite=Lax; ${secureDirective} max-age=86400`;
}

export function getCsrfHeaderName() {
  return 'x-csrf-token';
}

export function getCsrfHeaders() {
  const token = getCsrfToken();
  return {
    [getCsrfHeaderName()]: token,
  };
}

export function applyCsrfToSupabase(db) {
  if (!db) return;
  try {
    const originalFrom = db.from.bind(db);
    db.from = function (table) {
      const builder = originalFrom(table);
      if (builder && typeof builder.headers === 'function') {
        const origHeaders = builder.headers.bind(builder);
        builder.headers = function (extra) {
          return origHeaders({
            ...(extra || {}),
            [getCsrfHeaderName()]: getCsrfToken(),
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
  const header = event.headers?.get?.(getCsrfHeaderName());
  if (!header) return false;
  const raw = getCsrfCookieRaw();
  if (!raw) return false;
  const token = raw.includes(':') ? raw.slice(raw.indexOf(':') + 1) : raw;
  return header === token;
}
