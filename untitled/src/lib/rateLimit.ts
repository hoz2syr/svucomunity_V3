import { createRateLimiter } from '../hooks/useRateLimit';

export const loginRateLimiter = createRateLimiter({
  maxAttempts: 5,
  windowMs: 5 * 60 * 1000,
  storageKey: 'login_rate_limit',
});
