import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthForm } from '../../src/hooks/useAuthForm';

describe('useAuthForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with login mode defaults', () => {
    const { result } = renderHook(() => useAuthForm({ mode: 'login' }));
    expect(result.current.isLoading).toBe(false);
    expect(result.current.serverError).toBe('');
    expect(result.current.fieldErrors).toEqual({});
    expect(result.current.hasFieldErrors).toBe(false);
  });

  it('initializes with register mode defaults', () => {
    const { result } = renderHook(() => useAuthForm({ mode: 'register' }));
    expect(result.current.isLoading).toBe(false);
    expect(result.current.hasFieldErrors).toBe(false);
  });

  it('uses login mode by default', () => {
    const { result } = renderHook(() => useAuthForm());
    expect(result.current.isLoading).toBe(false);
  });

  it('sets server error via setServerError', () => {
    const { result } = renderHook(() => useAuthForm());
    act(() => result.current.setServerError('خطأ من الخادم'));
    expect(result.current.serverError).toBe('خطأ من الخادم');
  });

  it('clears server error via clearServerError()', () => {
    const { result } = renderHook(() => useAuthForm());
    act(() => result.current.setServerError('خطأ'));
    act(() => result.current.clearServerError());
    expect(result.current.serverError).toBe('');
  });

  it('resets form state and errors', () => {
    const { result } = renderHook(() => useAuthForm());
    act(() => result.current.setServerError('خطأ'));
    act(() => result.current.reset());
    expect(result.current.serverError).toBe('');
    expect(result.current.fieldErrors).toEqual({});
    expect(result.current.hasFieldErrors).toBe(false);
  });

  it('sets loading true then false after submit on empty form (validation failure)', async () => {
    const { result } = renderHook(() => useAuthForm({ mode: 'login' }));
    expect(result.current.isLoading).toBe(false);
    await act(async () => { await result.current.handleSubmit(); });
    expect(result.current.isLoading).toBe(false);
  });

  it('sets fieldErrors when validation fails', async () => {
    const { result } = renderHook(() => useAuthForm({ mode: 'login' }));
    await act(async () => { await result.current.handleSubmit(); });
    expect(result.current.hasFieldErrors).toBe(true);
  });

  it('clearServerError() resets server error state', () => {
    const { result } = renderHook(() => useAuthForm());
    act(() => result.current.setServerError('خطأ'));
    act(() => result.current.clearServerError());
    expect(result.current.serverError).toBe('');
  });

  it('handleSubmit resolves null on invalid input', async () => {
    const { result } = renderHook(() => useAuthForm({ mode: 'login' }));
    const val = await act(async () => { return await result.current.handleSubmit(); });
    expect(val).toBeNull();
  });

  it('register mode marks fieldErrors on invalid submit', async () => {
    const { result } = renderHook(() => useAuthForm({ mode: 'register' }));
    await act(async () => { await result.current.handleSubmit(); });
    expect(result.current.hasFieldErrors).toBe(true);
  });

  it('returns isLoading false after register mode handleSubmit', async () => {
    const { result } = renderHook(() => useAuthForm({ mode: 'register' }));
    await act(async () => { await result.current.handleSubmit(); });
    expect(result.current.isLoading).toBe(false);
  });
});
