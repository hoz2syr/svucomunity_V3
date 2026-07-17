export const RATE_LIMIT_ENDPOINT = '/functions/v1/rate-limit';

export type RateLimitOptions = {
  maxAttempts?: number;
  windowMs?: number;
  key?: string;
};

export type RateLimitStatus =
  | { blocked: false; remaining: number }
  | { blocked: true; retryAfterMs: number };

export type RateLimiter = {
  check: () => Promise<RateLimitStatus>;
  recordAttempt: (failed: boolean) => Promise<void>;
  reset: () => Promise<void>;
};

export const createRateLimiter = (options: RateLimitOptions = {}): RateLimiter => {
  const maxAttempts = options.maxAttempts ?? 5;
  const windowMs = options.windowMs ?? 60_000;
  const key = options.key ?? 'default';

  const check = async (): Promise<RateLimitStatus> => {
    try {
      const response = await fetch(RATE_LIMIT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, windowMs, maxAttempts }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        return { blocked: false, remaining: maxAttempts };
      }

      if (!data.allowed) {
        return { blocked: true, retryAfterMs: data.retryAfterMs ?? 0 };
      }

      return { blocked: false, remaining: maxAttempts - 1 };
    } catch {
      return { blocked: false, remaining: maxAttempts };
    }
  };

  const recordAttempt = async (_failed: boolean) => {
    await check();
  };

  const reset = async () => {
    await check();
  };

  return { check, recordAttempt, reset };
};

export const loginRateLimiter = createRateLimiter({
  maxAttempts: 5,
  windowMs: 5 * 60 * 1000,
  key: 'login',
});
