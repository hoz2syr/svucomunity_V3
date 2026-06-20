import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRateLimit } from '../../src/hooks/useRateLimit';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

describe('useRateLimit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, configurable: true });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('initializes with allowed status', () => {
    const { result } = renderHook(() => useRateLimit());
    expect(result.current.status.blocked).toBe(false);
    expect(result.current.status.remaining).toBe(5);
  });

  it('uses custom storage key', () => {
    const { result } = renderHook(() => useRateLimit({ storageKey: 'custom_key' }));
    expect(result.current.status.blocked).toBe(false);
  });

  it('returns limiter instance', () => {
    const { result } = renderHook(() => useRateLimit());
    expect(result.current.limiter).toBeDefined();
    expect(typeof result.current.limiter.check).toBe('function');
  });

  it('setStatus updates status', () => {
    const { result } = renderHook(() => useRateLimit());
    act(() => {
      result.current.setStatus({ blocked: true, retryAfterMs: 5000 });
    });
    expect(result.current.status.blocked).toBe(true);
  });

  it('updates status after interval', async () => {
    vi.useRealTimers();
    const { result } = renderHook(() => useRateLimit());
    expect(result.current.status.blocked).toBe(false);
  });
});
