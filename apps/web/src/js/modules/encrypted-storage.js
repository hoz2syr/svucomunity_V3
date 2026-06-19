/**
 * SVU Community — localStorage wrapper (plain text, NOT encrypted)
 *
 * WARNING: This module stores values in plain localStorage.
 * It does NOT encrypt, authenticate, or integrity-protect data.
 *
 * ONLY store non-sensitive data here:
 *   theme preference, language selection, tour flags, onboarding state
 *
 * NEVER store through this module:
 *   auth tokens, session identifiers, passwords, API keys,
 *   refresh tokens, CSRF tokens, personal data (PII), or any
 *   value whose confidentiality or integrity matters.
 *
 * Reason: localStorage is readable by any script on the origin.
 * A single XSS vulnerability or malicious browser extension can
 * read everything stored here. There is no safe substitute for
 * keeping secrets server-side or in HttpOnly cookies.
 *
 * Note: Despite its name, this module does not perform encryption.
 * Use `sessionStorage` or server-side storage for sensitive values.
 *
 * Runtime guard: keys matching *_token, *_secret, *_key, *_password,
 * session, auth, csrf, jwt, or similar trigger a console warning.
 */

const SENSITIVE_KEY_PATTERNS = /(token|secret|key|password|session|auth|csrf|jwt|private|pii|personal)/i;

function warnIfSensitive(key) {
  if (SENSITIVE_KEY_PATTERNS.test(key)) {
    console.warn(
      `[storage] Refusing implicit storage of sensitive key "${key}". ` +
      `This module uses plain localStorage. Use server-side storage or HttpOnly cookies instead.`
    );
  }
}

export function storageSet(key, value) {
  warnIfSensitive(key);
  const toStore = typeof value === 'string' ? value : JSON.stringify(value);
  try {
    localStorage.setItem(key, toStore);
  } catch {
    // storage unavailable (private mode, quota exceeded)
  }
}

export function storageGet(key) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  } catch {
    return null;
  }
}

export function storageRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // storage unavailable
  }
}
