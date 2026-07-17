import { useState, useEffect } from 'react';
import { RATE_LIMIT_POLL_INTERVAL_MS } from '@/src/lib/constants';
import { createRateLimiter, RateLimitOptions, RateLimitStatus, RateLimiter } from '../lib/rateLimit';

export type { RateLimitOptions, RateLimitStatus, RateLimiter };

export const useRateLimit = (options: RateLimitOptions = {}) => {
  const limiter = createRateLimiter(options);
  const [status, setStatus] = useState<RateLimitStatus>({ blocked: false, remaining: options.maxAttempts ?? 5 });

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      if (cancelled) return;
      const next = await limiter.check();
      if (!cancelled) {
        setStatus(next);
      }
    };

    poll();

    const interval = setInterval(() => {
      poll();
    }, RATE_LIMIT_POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [limiter, options.maxAttempts, options.windowMs, options.key]);

  return {
    limiter,
    status,
    setStatus,
  };
};
