import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useProfileSettings } from '../../../src/components/dashboard/useProfileSettings';

describe('useProfileSettings', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with default state', async () => {
    const { result } = renderHook(() => useProfileSettings(async () => null));
    expect(result.current.isLoading).toBe(false);
    expect(result.current.successMsg).toBe('');
    expect(result.current.errorMsg).toBe('');
  });

  it('shows success message on successful submit', async () => {
    const { result } = renderHook(() => useProfileSettings(async () => null));

    await act(async () => {
      await result.current.submit({ full_name: 'User', username: 'user', email: 'u@e.com' } as any);
    });

    expect(result.current.successMsg).toBe('تم حفظ التغييرات بنجاح');
    expect(result.current.isLoading).toBe(false);
  });

  it('shows error message on failed submit', async () => {
    const { result } = renderHook(() => useProfileSettings(async () => 'فشل الحفظ'));

    await act(async () => {
      await result.current.submit({} as any);
    });

    expect(result.current.errorMsg).toBe('فشل الحفظ');
    expect(result.current.isLoading).toBe(false);
  });

  it('calls onSubmit with data', async () => {
    const onSubmit = vi.fn(async () => null);
    const { result } = renderHook(() => useProfileSettings(onSubmit));

    await act(async () => {
      await result.current.submit({ full_name: 'name', username: 'un', email: 'e@e.com' } as any);
    });

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ full_name: 'name', username: 'un', email: 'e@e.com' }),
    );
  });

  it('sets error on thrown exception', async () => {
    const { result } = renderHook(() => useProfileSettings(async () => { throw new Error('boom'); }));

    await act(async () => {
      await result.current.submit({} as any);
    });

    expect(result.current.errorMsg).toBe('boom');
    expect(result.current.isLoading).toBe(false);
  });
});
