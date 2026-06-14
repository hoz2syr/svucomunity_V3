/**
 * SVU Community — Non-sensitive UI state storage (plain localStorage)
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
 * Note: This module does not perform encryption despite its historic
 * reference name. Use `sessionStorage` or server-side storage for
 * anything sensitive.
 */

export function storageSet(key, value) {
  try {
    const toStore = typeof value === 'string' ? value : JSON.stringify(value);
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
