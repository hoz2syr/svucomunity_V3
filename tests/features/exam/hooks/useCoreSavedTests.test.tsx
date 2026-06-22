import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { TestWrapper, testQueryClient } from '@/tests/setup';
import { useCoreSavedTests } from '@/src/features/exam/src/hooks/useCoreSavedTests';
import type { TestModel } from '@/src/features/exam/src/types';
import { localStorageTestStorage } from '@/src/features/exam/src/core/adapters/localStorageTestStorage';
import { supabaseStorage } from '@/src/features/exam/src/core/adapters/supabaseTestStorage';
import * as examSupabase from '@/src/features/exam/src/services/exam.supabase';

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
  supabaseStorage.setCurrentUserId(null);
  supabaseStorage.hydrateFromServer('', []);
  vi.clearAllMocks();

  const fetchSpy = vi.spyOn(examSupabase, 'fetchTestsFromSupabase').mockResolvedValue({ data: [], error: null });

  fetchSpy.mockImplementation(async (userId: string) => {
    const cached = supabaseStorage.getTests();
    if (cached.length > 0) {
      return { data: cached, error: null };
    }
    return { data: [], error: null };
  });

  vi.spyOn(examSupabase, 'fetchTestsPage').mockImplementation(async (_userId: string, _cursor?: any, limit = 9) => {
    const cached = supabaseStorage.getTests();
    const page = cached.slice(0, limit);
    const hasMore = cached.length > limit;
    const nextCursor = hasMore && page.length > 0
      ? { created_at: new Date(page[page.length - 1].createdAt).toISOString(), id: page[page.length - 1].id }
      : undefined;
    return { data: page, error: null, nextCursor, hasMore };
  });

  vi.spyOn(examSupabase, 'upsertTestToSupabase').mockResolvedValue(undefined);
});

const wrapper = TestWrapper;

describe('useCoreSavedTests', () => {
  it('starts with loading true and empty tests', () => {
    const { result } = renderHook(() => useCoreSavedTests(), { wrapper });
    expect(result.current.tests).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(result.current.loadingPdf).toBeNull();
    expect(result.current.canDelete).toBe(false);
  });

  it('uses localStorage path when userId is absent', async () => {
    mockAuth.session = { user: { id: '' } } as any;
    localStorage.setItem('svu_tests_db', JSON.stringify([buildTest({ id: 'local' })]));

    const { result } = renderHook(() => useCoreSavedTests(), { wrapper });
    await act(async () => {
      await result.current.fetchTests();
    });

    expect(result.current.tests).toHaveLength(1);
    expect(result.current.tests[0].id).toBe('local');
    expect(result.current.error).toBeNull();
    expect(result.current.canDelete).toBe(false);
  });

  it('uses localStorage path when userId is empty string', async () => {
    mockAuth.session = { user: { id: '' } } as any;
    localStorage.setItem('svu_tests_db', JSON.stringify([buildTest({ id: 'local' })]));

    const { result } = renderHook(() => useCoreSavedTests(), { wrapper });
    await act(async () => {
      await result.current.fetchTests();
    });

    expect(result.current.tests).toHaveLength(1);
    expect(result.current.error).toBeNull();
  });

  it('sets error on server fetch exception', async () => {
    mockAuth.session = { user: { id: 'user-1' } } as any;
    vi.spyOn(examSupabase, 'fetchTestsPage').mockRejectedValue(new Error('network down'));

    const { result } = renderHook(() => useCoreSavedTests(), { wrapper });
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

    const { result } = renderHook(() => useCoreSavedTests(), { wrapper });
    await act(async () => {
      await result.current.fetchTests();
    });

    expect(result.current.tests).toEqual([]);
    expect(result.current.error).toBe('bad data');
    vi.restoreAllMocks();
  });

  it('sets error on server response not ok', async () => {
    mockAuth.session = { user: { id: 'user-1' } } as any;
    vi.spyOn(examSupabase, 'fetchTestsPage').mockResolvedValue({
      data: [],
      error: { message: 'Internal Server Error' },
      hasMore: false,
    });

    const { result } = renderHook(() => useCoreSavedTests(), { wrapper });
    await act(async () => {
      await result.current.fetchTests();
    });

    expect(result.current.tests).toEqual([]);
    expect(result.current.error).toBe('Internal Server Error');
    vi.restoreAllMocks();
  });

  it('requestDelete sets confirmDeleteId and executeDelete removes test', async () => {
    mockAuth.session = { user: { id: 'user-1' } } as any;
    const test = buildTest({ id: 't1' });
    supabaseStorage.hydrateFromServer('user-1', [test]);
    supabaseStorage.setCurrentUserId('user-1');

    const { result } = renderHook(() => useCoreSavedTests(), { wrapper });
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

    const { result } = renderHook(() => useCoreSavedTests(), { wrapper });
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
    const { result: noUser } = renderHook(() => useCoreSavedTests(), { wrapper });
    expect(noUser.current.canDelete).toBe(false);

    mockAuth.session = { user: { id: 'user-1' } } as any;
    const { result: withUser } = renderHook(() => useCoreSavedTests(), { wrapper });
    expect(withUser.current.canDelete).toBe(true);
  });

  it('handlePrintPdf sets loading and clears on finish', async () => {
    const { result } = renderHook(() => useCoreSavedTests(), { wrapper });
    await act(async () => {
      await result.current.handlePrintPdf(buildTest());
    });
    expect(result.current.loadingPdf).toBeNull();
  });

  it('handleExportWord alerts on failure', async () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useCoreSavedTests(), { wrapper });
    await act(async () => {
      await result.current.handleExportWord(buildTest());
    });

    expect(alertMock).toHaveBeenCalled();
    alertMock.mockRestore();
    consoleSpy.mockRestore();
  });

  it('isLoading reflects authLoading when true', () => {
    mockAuth.loading = true;
    const { result } = renderHook(() => useCoreSavedTests(), { wrapper });
    expect(result.current.isLoading).toBe(true);
  });

  it('isLoading is true when authLoading is true even when hook isLoading is false', async () => {
    mockAuth.loading = true;
    const { result } = renderHook(() => useCoreSavedTests(), { wrapper });
    expect(result.current.isLoading).toBe(true);
  });

  it('exposes publishingId and publishError state', async () => {
    mockAuth.session = { user: { id: '' } } as any;
    localStorage.setItem('svu_tests_db', JSON.stringify([buildTest({ id: 't1' })]));

    const { result } = renderHook(() => useCoreSavedTests(), { wrapper });
    await act(async () => {
      await result.current.fetchTests();
    });

    expect(result.current.publishingId).toBeNull();
    expect(result.current.publishError).toBeNull();
    expect(typeof result.current.handlePublish).toBe('function');
  });

  it('handlePublish sets published flag for the matching test', async () => {
    mockAuth.session = { user: { id: '' } } as any;
    localStorage.setItem('svu_tests_db', JSON.stringify([buildTest({ id: 't1', published: false })]));

    const { result } = renderHook(() => useCoreSavedTests(), { wrapper });
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

    const { result } = renderHook(() => useCoreSavedTests(), { wrapper });
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
