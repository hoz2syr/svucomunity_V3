import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRateLimit, createRateLimiter } from '../../src/hooks/useRateLimit';

describe('createRateLimiter', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts with all attempts available', () => {
    const limiter = createRateLimiter({ maxAttempts: 5 });
    const status = limiter.check();
    expect(status.blocked).toBe(false);
    expect(status.remaining).toBe(5);
  });

  it('decrements remaining after failed attempt', () => {
    const limiter = createRateLimiter({ maxAttempts: 5 });
    limiter.recordAttempt(true);
    const status = limiter.check();
    expect(status.remaining).toBe(4);
  });

  it('blocks after max failed attempts', () => {
    const limiter = createRateLimiter({ maxAttempts: 3 });
    limiter.recordAttempt(true);
    limiter.recordAttempt(true);
    limiter.recordAttempt(true);
    const status = limiter.check();
    expect(status.blocked).toBe(true);
    expect(status.retryAfterMs).toBeGreaterThan(0);
  });

  it('resets remaining after successful attempt', () => {
    const limiter = createRateLimiter({ maxAttempts: 5 });
    limiter.recordAttempt(true);
    limiter.recordAttempt(true);
    limiter.recordAttempt(false);
    const status = limiter.check();
    expect(status.remaining).toBe(5);
  });

  it('recovers after window expires', async () => {
    vi.useFakeTimers();
    const limiter = createRateLimiter({ maxAttempts: 2, windowMs: 1000 });
    limiter.recordAttempt(true);
    limiter.recordAttempt(true);
    expect(limiter.check().blocked).toBe(true);

    await vi.advanceTimersByTimeAsync(1001);
    expect(limiter.check().blocked).toBe(false);
    expect(limiter.check().remaining).toBe(2);
    vi.useRealTimers();
  });

  it('resets limiter completely', () => {
    const limiter = createRateLimiter({ maxAttempts: 3 });
    limiter.recordAttempt(true);
    limiter.recordAttempt(true);
    limiter.reset();
    const status = limiter.check();
    expect(status.remaining).toBe(3);
    expect(status.blocked).toBe(false);
  });

  it('uses custom storage key', () => {
    const limiter = createRateLimiter({ maxAttempts: 3, storageKey: 'custom_key' });
    limiter.recordAttempt(true);
    expect(localStorage.getItem('custom_key')).not.toBeNull();
  });

  it('survives corrupt localStorage', () => {
    localStorage.setItem('auth_rate_limit_v1', 'not-json{{{');
    const limiter = createRateLimiter();
    const status = limiter.check();
    expect(status.blocked).toBe(false);
    expect(status.remaining).toBe(5);
  });
});

describe('useRateLimit hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('initializes with allowed status', () => {
    const { result } = renderHook(() => useRateLimit());
    expect(result.current.status.blocked).toBe(false);
  });

  it('returns limiter instance with correct methods', () => {
    const { result } = renderHook(() => useRateLimit());
    expect(result.current.limiter).toBeDefined();
    expect(typeof result.current.limiter.check).toBe('function');
    expect(typeof result.current.limiter.recordAttempt).toBe('function');
    expect(typeof result.current.limiter.reset).toBe('function');
  });

  it('allows manual status update via setStatus', () => {
    const { result } = renderHook(() => useRateLimit());
    act(() => {
      result.current.setStatus({ blocked: true, retryAfterMs: 3000 });
    });
    expect(result.current.status.blocked).toBe(true);
    expect(result.current.status.retryAfterMs).toBe(3000);
  });

  it('uses custom storage key', () => {
    const { result } = renderHook(() => useRateLimit({ storageKey: 'login_rate_limit' }));
    expect(result.current.status.blocked).toBe(false);
    expect(result.current.limiter).toBeDefined();
  });
});
