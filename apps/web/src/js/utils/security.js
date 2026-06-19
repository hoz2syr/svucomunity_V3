/**
 * SVU Community — Security utilities
 *
 * Provides timing randomization to reduce fingerprinting and
 * timing-based enumeration attacks on authentication endpoints.
 */

const AUTH_DELAY_MIN_MS = 100;
const AUTH_DELAY_MAX_MS = 300;

export function randomAuthDelay() {
  const jitter = Math.floor(Math.random() * (AUTH_DELAY_MAX_MS - AUTH_DELAY_MIN_MS + 1)) + AUTH_DELAY_MIN_MS;
  return new Promise((resolve) => setTimeout(resolve, jitter));
}
