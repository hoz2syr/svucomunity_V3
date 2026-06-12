import { describe, expect, it, vi } from 'vitest';
import { formatDate, debounce, initRouter } from '../../js/modules/utils/helpers.js';

describe('utils', () => {
  it('formatDate returns en-US formatted date', () => {
    const result = formatDate('2025-01-15');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('debounce delays execution and cancels prior calls', async () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounce(fn, 300);
    debounced(); debounced(); debounced();
    expect(fn).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(300);
    expect(fn).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('initRouter does not throw', () => {
    expect(() => initRouter()).not.toThrow();
  });
});
