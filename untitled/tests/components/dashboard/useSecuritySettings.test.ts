import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSecuritySettings } from '../../../src/components/dashboard/useSecuritySettings';

describe('useSecuritySettings', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with default state', async () => {
    const { result } = renderHook(() => useSecuritySettings(async () => null));
    expect(result.current.isLoading).toBe(false);
    expect(result.current.successMsg).toBe('');
    expect(result.current.errorMsg).toBe('');
  });

  it('shows success message on successful submit', async () => {
    const { result } = renderHook(() => useSecuritySettings(async () => null));

    await act(async () => {
      await result.current.submit({ current_password: 'old', new_password: 'NewPass1!', confirm_password: 'NewPass1!' } as any);
    });

    expect(result.current.successMsg).toBe('تم تحديث كلمة المرور بنجاح');
    expect(result.current.isLoading).toBe(false);
  });

  it('shows error message on failed submit', async () => {
    const { result } = renderHook(() => useSecuritySettings(async () => 'فشل التحديث'));

    await act(async () => {
      await result.current.submit({} as any);
    });

    expect(result.current.errorMsg).toBe('فشل التحديث');
    expect(result.current.isLoading).toBe(false);
  });

  it('calls onSuccess callback on successful submit', async () => {
    const onSuccess = vi.fn();
    const { result } = renderHook(() => useSecuritySettings(async () => null, onSuccess));

    await act(async () => {
      await result.current.submit({ current_password: 'old', new_password: 'NewPass1!', confirm_password: 'NewPass1!' } as any);
    });

    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('does not call onSuccess on failed submit', async () => {
    const onSuccess = vi.fn();
    const { result } = renderHook(() => useSecuritySettings(async () => 'خطأ', onSuccess));

    await act(async () => {
      await result.current.submit({} as any);
    });

    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('calls onSubmit with provided data', async () => {
    const onSubmit = vi.fn(async () => null);
    const { result } = renderHook(() => useSecuritySettings(onSubmit));

    const data = { current_password: 'old', new_password: 'abcABC123!', confirm_password: 'abcABC123!' };
    await act(async () => {
      await result.current.submit(data as any);
    });

    expect(onSubmit).toHaveBeenCalledWith(data);
  });

  it('handles thrown exception gracefully', async () => {
    const { result } = renderHook(() => useSecuritySettings(async () => { throw new Error('pex'); }));

    await act(async () => {
      await result.current.submit({} as any);
    });

    expect(result.current.errorMsg).toBe('pex');
    expect(result.current.isLoading).toBe(false);
  });

  it('accepts undefined onSuccess without error', async () => {
    const { result } = renderHook(() => useSecuritySettings(async () => null));

    await act(async () => {
      await result.current.submit({ current_password: 'old', new_password: 'NewPass1!', confirm_password: 'NewPass1!' } as any);
    });

    expect(result.current.successMsg).toBe('تم تحديث كلمة المرور بنجاح');
  });
});
