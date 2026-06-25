import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCopyToClipboard } from '@/src/features/exam/src/hooks/useCopyToClipboard';

describe('useCopyToClipboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns isCopied=false initially', () => {
    const { result } = renderHook(() => useCopyToClipboard('hello'));
    expect(result.current.isCopied).toBe(false);
  });

  it('copies text via clipboard API when available', async () => {
    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mockWriteText },
      configurable: true,
    });

    const { result } = renderHook(() => useCopyToClipboard('hello world'));
    await act(async () => {
      result.current.copy();
    });
    expect(mockWriteText).toHaveBeenCalledWith('hello world');
    expect(result.current.isCopied).toBe(true);
  });

  it('falls back to textarea when clipboard API unavailable', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      configurable: true,
    });

    const { result } = renderHook(() => useCopyToClipboard('fallback text'));
    await act(async () => {
      result.current.copy();
    });
    expect(result.current.isCopied).toBe(true);
  });

  it('resets isCopied after 2 seconds', async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useCopyToClipboard('reset test'));
    act(() => result.current.copy());
    expect(result.current.isCopied).toBe(true);
    await act(async () => {
      vi.advanceTimersByTime(2100);
    });
    expect(result.current.isCopied).toBe(false);
    vi.useRealTimers();
  });
});
