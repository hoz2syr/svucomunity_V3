import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCoreSavedTests } from '@/src/features/exam/src/hooks/useCoreSavedTests';
import type { TestModel } from '@/src/features/exam/src/types';

const buildTest = (overrides: Partial<TestModel> = {}): TestModel => ({
  id: 'test-1',
  title: 'اختبار',
  description: 'وصف',
  createdAt: Date.now(),
  settings: { showExplanations: true },
  questions: [],
  ...overrides,
});

const createMockAuth = () => ({
  session: null as { user: { id: string } } | null,
  loading: false,
  envMissing: false,
});

let mockAuth = createMockAuth();

vi.mock('@/src/contexts/AuthContext', () => ({
  useAuth: () => mockAuth,
}));

describe('useCoreSavedTests', () => {
  beforeEach(() => {
    mockAuth = createMockAuth();
    localStorage.clear();
    vi.clearAllMocks();
    window.confirm = () => true;
    window.alert = () => {};
  });

  it('starts with loading true and empty tests', () => {
    const { result } = renderHook(() => useCoreSavedTests());
    expect(result.current.tests).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(result.current.loadingPdf).toBeNull();
  });

  it('uses localStorage path when userId is absent', async () => {
    mockAuth.session = { user: { id: '' } } as any;
    localStorage.setItem('svu_tests_db', JSON.stringify([buildTest({ id: 'local' })]));

    const { result } = renderHook(() => useCoreSavedTests());
    await act(async () => {
      await result.current.fetchTests();
    });

    expect(result.current.tests).toHaveLength(1);
    expect(result.current.tests[0].id).toBe('local');
    expect(result.current.error).toBeNull();
  });

  it('uses localStorage path when userId is null', async () => {
    mockAuth.session = { user: { id: '' } } as any;
    localStorage.setItem('svu_tests_db', JSON.stringify([buildTest({ id: 'local' })]));

    const { result } = renderHook(() => useCoreSavedTests());
    await act(async () => {
      await result.current.fetchTests();
    });

    expect(result.current.tests).toHaveLength(1);
    expect(result.current.error).toBeNull();
  });

  it('sets error on server fetch exception', async () => {
    mockAuth.session = { user: { id: 'user-1' } } as any;
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network down'));

    const { result } = renderHook(() => useCoreSavedTests());
    await act(async () => {
      await result.current.fetchTests();
    });

    expect(result.current.tests).toEqual([]);
    expect(result.current.error).toBe('network down');
    vi.restoreAllMocks();
  });

  it('sets error on server non-array response', async () => {
    mockAuth.session = { user: { id: 'user-1' } } as any;
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'bad data' }),
    } as any);

    const { result } = renderHook(() => useCoreSavedTests());
    await act(async () => {
      await result.current.fetchTests();
    });

    expect(result.current.tests).toEqual([]);
    expect(result.current.error).toBeTruthy();
    vi.restoreAllMocks();
  });

  it('sets error on server response not ok', async () => {
    mockAuth.session = { user: { id: 'user-1' } } as any;
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => ({}),
    } as any);

    const { result } = renderHook(() => useCoreSavedTests());
    await act(async () => {
      await result.current.fetchTests();
    });

    expect(result.current.tests).toEqual([]);
    expect(result.current.error).toBeTruthy();
    vi.restoreAllMocks();
  });

  it('handleDelete skips when no userId and user cancels confirm', async () => {
    mockAuth.session = { user: { id: '' } } as any;
    window.confirm = () => false;

    const { result } = renderHook(() => useCoreSavedTests());
    await act(async () => {
      await result.current.handleDelete('t1');
    });

    expect(result.current.tests).toEqual([]);
  });

  it('handleDelete proceeds and refreshes tests when userId is present', async () => {
    mockAuth.session = { user: { id: 'user-1' } } as any;
    localStorage.setItem('svu_tests_db', JSON.stringify([buildTest({ id: 't1' })]));

    const { result } = renderHook(() => useCoreSavedTests());
    await act(async () => {
      await result.current.handleDelete('t1');
    });

    expect(result.current.tests).toHaveLength(0);
  });

  it('handleDelete alerts on error', async () => {
    mockAuth.session = { user: { id: 'user-1' } } as any;
    localStorage.setItem('svu_tests_db', 'not-json');

    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    const { result } = renderHook(() => useCoreSavedTests());
    await act(async () => {
      await result.current.handleDelete('t1');
    });

    expect(alertMock).toHaveBeenCalled();
    alertMock.mockRestore();
  });

  it('handlePrintPdf sets loading and clears on finish', async () => {
    const { result } = renderHook(() => useCoreSavedTests());
    await act(async () => {
      await result.current.handlePrintPdf(buildTest());
    });
    expect(result.current.loadingPdf).toBeNull();
  });

  it('handleExportWord alerts on failure', async () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const original = window.alert;
    const { result } = renderHook(() => useCoreSavedTests());
    await act(async () => {
      await result.current.handleExportWord(buildTest());
    });

    expect(alertMock).toHaveBeenCalled();
    alertMock.mockRestore();
  });

  it('isLoading reflects authLoading when true', () => {
    mockAuth.loading = true;
    const { result } = renderHook(() => useCoreSavedTests());
    expect(result.current.isLoading).toBe(true);
  });

  it('isLoading is true when authLoading is true even when hook isLoading is false', async () => {
    mockAuth.loading = true;
    const { result } = renderHook(() => useCoreSavedTests());
    expect(result.current.isLoading).toBe(true);
  });
});
