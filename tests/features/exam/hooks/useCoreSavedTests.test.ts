import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCoreSavedTests } from '@/src/features/exam/src/hooks/useCoreSavedTests';
import type { TestModel } from '@/src/features/exam/src/types';
import { localStorageTestStorage } from '@/src/features/exam/src/core/storage/localStorageTestStorage';
import { supabaseStorage } from '@/src/features/exam/src/core/adapters/supabaseTestStorage';
import * as examSupabase from '@/src/features/exam/src/services/exam.supabase';
import { TestWrapper, testQueryClient } from '@/tests/setup';

const buildTest = (overrides: Partial<TestModel> = {}): TestModel => ({
  id: 'test-1',
  title: 'اختبار',
  description: 'وصف',
  createdAt: Date.now(),
  settings: { showExplanations: true },
  questions: [],
  published: false,
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

beforeEach(() => {
  testQueryClient.clear();
  mockAuth = createMockAuth();
  localStorage.clear();
  supabaseStorage.currentUserId = null;
  supabaseStorage.cachedTests = [];
  localStorageTestStorage.currentUserId = null;
  vi.clearAllMocks();

  supabaseStorage.setCurrentUserId('user-1');

  vi.spyOn(examSupabase, 'fetchTestsFromSupabase').mockImplementation((uid: string) => {
    if (supabaseStorage.currentUserId !== uid) return Promise.resolve({ data: [], error: null });
    return Promise.resolve({ data: [...supabaseStorage.cachedTests], error: null });
  });

  vi.spyOn(examSupabase, 'fetchTestsPage').mockImplementation((uid: string, cursor: any, limit = 9) => {
    if (supabaseStorage.currentUserId !== uid) return Promise.resolve({ data: [], error: null, hasMore: false, nextCursor: undefined });
    const all = [...supabaseStorage.cachedTests];
    const startIdx = cursor
      ? all.findIndex(t => t.id === cursor.id && new Date(t.createdAt).toISOString() === cursor.created_at)
      : -1;
    const slice = startIdx >= 0 ? all.slice(startIdx + 1, startIdx + 1 + limit) : all.slice(0, limit);
    const hasMore = all.length > (startIdx >= 0 ? startIdx + 1 : 0) + limit;
    const nextCursor = hasMore && slice.length > 0
      ? { created_at: new Date(slice[slice.length - 1].createdAt).toISOString(), id: slice[slice.length - 1].id }
      : undefined;
    return Promise.resolve({ data: slice, error: null, hasMore, nextCursor });
  });

  vi.spyOn(examSupabase, 'upsertTestToSupabase').mockResolvedValue(undefined);
  vi.spyOn(examSupabase, 'deleteTestFromSupabase').mockResolvedValue(undefined);
});

describe('useCoreSavedTests', () => {
  it('starts with loading true and empty tests', () => {
    const { result } = renderHook(() => useCoreSavedTests(), { wrapper: TestWrapper });
    expect(result.current.tests).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(result.current.loadingPdf).toBeNull();
    expect(result.current.canDelete).toBe(false);
  });

  it('uses localStorage path when userId is absent', async () => {
    mockAuth.session = { user: { id: '' } } as any;
    localStorage.setItem('svu_tests_db', JSON.stringify([buildTest({ id: 'local' })]));

    const { result } = renderHook(() => useCoreSavedTests(), { wrapper: TestWrapper });
    await act(async () => {
      await result.current.fetchTests();
    });

    expect(result.current.tests).toHaveLength(1);
    expect(result.current.tests[0].id).toBe('local');
    expect(result.current.error).toBeNull();
    expect(result.current.canDelete).toBe(false);
  });

  it('preserves guest tests when logging in with empty server (new account)', async () => {
    const guestTest = buildTest({ id: 'guest-1', title: 'اختبار ضيف' });
    localStorageTestStorage.saveTest(guestTest);

    mockAuth.session = { user: { id: 'user-1' } } as any;

    const { result } = renderHook(() => useCoreSavedTests(), { wrapper: TestWrapper });
    await act(async () => {
      await result.current.fetchTests();
    });

    console.debug('[TST1] after fetchTests', { tests: result.current.tests.map(t => t.id), sbCached: supabaseStorage.cachedTests.map(t => t.id), localLen: localStorageTestStorage.getTests().length });

    await waitFor(() => {
      expect(result.current.tests.some(t => t.id === 'guest-1')).toBe(true);
    }, { timeout: 5000 });
    expect(result.current.tests.some(t => t.title === 'اختبار ضيف')).toBe(true);
    expect(result.current.canDelete).toBe(true);
  });

  it('merges guest tests with existing server tests on login', async () => {
    const guestTest = buildTest({ id: 'guest-only' });
    const serverTest = buildTest({ id: 'server-only' });
    localStorageTestStorage.saveTest(guestTest);
    supabaseStorage.hydrateFromServer('user-1', [serverTest]);

    mockAuth.session = { user: { id: 'user-1' } } as any;

    const { result } = renderHook(() => useCoreSavedTests(), { wrapper: TestWrapper });
    await act(async () => {
      await result.current.fetchTests();
    });

    console.debug('[TST2] after fetchTests', { tests: result.current.tests.map(t => t.id), sbCached: supabaseStorage.cachedTests.map(t => t.id), localLen: localStorageTestStorage.getTests().length });

    await waitFor(() => {
      expect(result.current.tests.map(t => t.id).sort()).toEqual(['guest-only', 'server-only'].sort());
    }, { timeout: 5000 });
  });

  it('uses localStorage path when userId is empty string', async () => {
    mockAuth.session = { user: { id: '' } } as any;
    localStorage.setItem('svu_tests_db', JSON.stringify([buildTest({ id: 'local' })]));

    const { result } = renderHook(() => useCoreSavedTests(), { wrapper: TestWrapper });
    await act(async () => {
      await result.current.fetchTests();
    });

    expect(result.current.tests).toHaveLength(1);
    expect(result.current.error).toBeNull();
  });

  it('sets error on server fetch exception', async () => {
    mockAuth.session = { user: { id: 'user-1' } } as any;
    vi.spyOn(examSupabase, 'fetchTestsPage').mockRejectedValue(new Error('network down'));

    const { result } = renderHook(() => useCoreSavedTests(), { wrapper: TestWrapper });
    await act(async () => {
      await result.current.fetchTests();
    });

    expect(result.current.tests).toEqual([]);
    expect(result.current.error).toBe('network down');
    vi.restoreAllMocks();
  });

  it('sets error on server non-array response', async () => {
    mockAuth.session = { user: { id: 'user-1' } } as any;
    vi.spyOn(examSupabase, 'fetchTestsPage').mockResolvedValue({
      data: [],
      error: { message: 'bad data' },
      hasMore: false,
    });

    const { result } = renderHook(() => useCoreSavedTests(), { wrapper: TestWrapper });
    await act(async () => {
      await result.current.fetchTests();
    });

    expect(result.current.tests).toEqual([]);
    expect(result.current.error).toBe('bad data');
    vi.restoreAllMocks();
  });

  it('requestDelete sets confirmDeleteId and executeDelete removes test', async () => {
    mockAuth.session = { user: { id: 'user-1' } } as any;
    const test = buildTest({ id: 't1' });
    supabaseStorage.hydrateFromServer('user-1', [test]);
    supabaseStorage.setCurrentUserId('user-1');

    const { result } = renderHook(() => useCoreSavedTests(), { wrapper: TestWrapper });
    await act(async () => {
      await result.current.fetchTests();
    });

    expect(result.current.tests).toHaveLength(1);
    expect(result.current.confirmDeleteId).toBeNull();

    act(() => result.current.requestDelete('t1'));
    expect(result.current.confirmDeleteId).toBe('t1');

    await act(async () => {
      await result.current.executeDelete();
    });

    expect(result.current.tests).toHaveLength(0);
    expect(result.current.confirmDeleteId).toBeNull();
    vi.restoreAllMocks();
  });

  it('executeDelete alerts when storage throws', async () => {
    mockAuth.session = { user: { id: '' } } as any;
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const storageSpy = vi.spyOn(localStorageTestStorage, 'deleteTest').mockImplementation(() => {
      throw new Error('storage delete failed');
    });

    const { result } = renderHook(() => useCoreSavedTests(), { wrapper: TestWrapper });
    await act(async () => {
      await result.current.fetchTests();
    });

    act(() => {
      result.current.requestDelete('t1');
    });
    expect(result.current.confirmDeleteId).toBe('t1');

    await act(async () => {
      await result.current.executeDelete();
    });

    expect(alertMock).toHaveBeenCalled();
    storageSpy.mockRestore();
    alertMock.mockRestore();
  });

  it('reveals canDelete true with userId and false without', async () => {
    mockAuth.session = null;
    const { result: noUser } = renderHook(() => useCoreSavedTests(), { wrapper: TestWrapper });
    expect(noUser.current.canDelete).toBe(false);

    mockAuth.session = { user: { id: 'user-1' } } as any;
    const { result: withUser } = renderHook(() => useCoreSavedTests(), { wrapper: TestWrapper });
    expect(withUser.current.canDelete).toBe(true);
  });

  it('handlePrintPdf sets loading and clears on finish', async () => {
    const { result } = renderHook(() => useCoreSavedTests(), { wrapper: TestWrapper });
    await act(async () => {
      await result.current.handlePrintPdf(buildTest());
    });
    expect(result.current.loadingPdf).toBeNull();
  });

  it('handleExportWord alerts on failure', async () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useCoreSavedTests(), { wrapper: TestWrapper });
    await act(async () => {
      await result.current.handleExportWord(buildTest());
    });

    expect(alertMock).toHaveBeenCalled();
    alertMock.mockRestore();
    consoleSpy.mockRestore();
  });

  it('isLoading reflects authLoading when true', () => {
    mockAuth.loading = true;
    const { result } = renderHook(() => useCoreSavedTests(), { wrapper: TestWrapper });
    expect(result.current.isLoading).toBe(true);
  });

  it('exposes pagination fields from useInfiniteQuery', async () => {
    mockAuth.session = { user: { id: 'user-1' } } as any;
    const manyTests = Array.from({ length: 5 }, (_, i) => buildTest({ id: `t${i}` }));
    supabaseStorage.hydrateFromServer('user-1', manyTests);
    supabaseStorage.setCurrentUserId('user-1');

    const { result } = renderHook(() => useCoreSavedTests(), { wrapper: TestWrapper });
    await act(async () => {
      await result.current.fetchTests();
    });

    expect(typeof result.current.fetchNextPage).toBe('function');
    expect(typeof result.current.hasNextPage).toBe('boolean');
    expect(typeof result.current.isFetchingNextPage).toBe('boolean');
  });

  it('handlePublish sets published flag for the matching test', async () => {
    mockAuth.session = { user: { id: '' } } as any;
    localStorage.setItem('svu_tests_db', JSON.stringify([buildTest({ id: 't1', published: false })]));

    const { result } = renderHook(() => useCoreSavedTests(), { wrapper: TestWrapper });
    await act(async () => {
      await result.current.fetchTests();
    });

    await act(async () => {
      await result.current.handlePublish('t1');
    });

    expect(result.current.publishingId).toBeNull();
    const updated = result.current.tests.find(test => test.id === 't1');
    expect(updated?.published).toBe(true);
  });

  it('handlePublish surfaces error when test is missing', async () => {
    mockAuth.session = { user: { id: '' } } as any;
    localStorage.setItem('svu_tests_db', JSON.stringify([buildTest({ id: 't1' })]));

    const { result } = renderHook(() => useCoreSavedTests(), { wrapper: TestWrapper });
    await act(async () => {
      await result.current.fetchTests();
    });

    await act(async () => {
      try {
        await result.current.handlePublish('missing');
      } catch {
        // expected: handlePublish re-throws after surfacing publishError
      }
    });

    expect(result.current.publishError).toBeTruthy();
    expect(result.current.publishingId).toBeNull();
  });
});
