import { useState, useEffect } from 'react';

export type RateLimitOptions = {
  maxAttempts?: number;
  windowMs?: number;
  storageKey?: string;
};

export type RateLimitStatus =
  | { blocked: false; remaining: number }
  | { blocked: true; retryAfterMs: number };

export type RateLimiter = {
  check: () => RateLimitStatus;
  recordAttempt: (failed: boolean) => void;
  reset: () => void;
};

export const createRateLimiter = (options: RateLimitOptions = {}): RateLimiter => {
  const maxAttempts = options.maxAttempts ?? 5;
  const windowMs = options.windowMs ?? 5 * 60 * 1000;
  const storageKey = options.storageKey ?? 'auth_rate_limit_v1';

  const read = (): { attempts: number; resetAt: number | null } => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return { attempts: 0, resetAt: null };
      return JSON.parse(raw) as { attempts: number; resetAt: number | null };
    } catch {
      return { attempts: 0, resetAt: null };
    }
  };

  const write = (value: { attempts: number; resetAt: number | null }) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(value));
    } catch {
      // ignore quota / private mode
    }
  };

  const check = (): RateLimitStatus => {
    const state = read();
    const now = Date.now();

    if (state.resetAt && now < state.resetAt) {
      return { blocked: true, retryAfterMs: state.resetAt - now };
    }

    if (state.resetAt && now >= state.resetAt) {
      write({ attempts: 0, resetAt: null });
      return { blocked: false, remaining: maxAttempts };
    }

    return { blocked: false, remaining: Math.max(0, maxAttempts - state.attempts) };
  };

  const recordAttempt = (failed: boolean) => {
    const state = read();
    const now = Date.now();

    if (!failed) {
      write({ attempts: 0, resetAt: null });
      return;
    }

    const nextAttempts = state.attempts + 1;
    const shouldBlock = nextAttempts >= maxAttempts;

    write({
      attempts: nextAttempts,
      resetAt: shouldBlock ? now + windowMs : state.resetAt,
    });
  };

  const reset = () => write({ attempts: 0, resetAt: null });

  return { check, recordAttempt, reset };
};

export const useRateLimit = (options: RateLimitOptions = {}) => {
  const limiterRef = { current: createRateLimiter(options) };
  const [status, setStatus] = useState<RateLimitStatus>(() => limiterRef.current.check());

  useEffect(() => {
    const limiter = limiterRef.current;

    const interval = setInterval(() => {
      const next = limiter.check();
      setStatus(next);
    }, 1000);

    const onStorage = (e: StorageEvent) => {
      if (e.key === options.storageKey) {
        setStatus(limiter.check());
      }
    };

    window.addEventListener('storage', onStorage);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', onStorage);
    };
  }, [options.storageKey]);

  return {
    limiter: limiterRef.current,
    status,
    setStatus,
  };
};
