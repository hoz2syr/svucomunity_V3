export type RateLimitStatus =
  | { blocked: false; remaining: number }
  | { blocked: true; retryAfterMs: number };

export type RateLimitResult =
  | { ok: true; status: RateLimitStatus }
  | { ok: false; status: { blocked: true; retryAfterMs: number } };

export type RateLimiter = {
  check: () => RateLimitResult;
  recordAttempt: (failed?: boolean) => void;
  reset: () => void;
};
