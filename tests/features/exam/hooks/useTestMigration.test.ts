import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTestMigration } from '@/src/features/exam/src/hooks/useTestMigration';
import { localStorageTestStorage } from '@/src/features/exam/src/core/storage/localStorageTestStorage';
import { supabaseStorage } from '@/src/features/exam/src/core/adapters/supabaseTestStorage';
import * as examSupabase from '@/src/features/exam/src/services/exam.supabase';
import type { TestModel } from '@/src/features/exam/src/types';
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

const mockSetQueryData = vi.fn();
const mockInvalidateQueries = vi.fn();

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('@tanstack/react-query');
  return {
    ...actual,
    useQueryClient: () => ({
      setQueryData: (...args: unknown[]) => mockSetQueryData(...args),
      invalidateQueries: (...args: unknown[]) => mockInvalidateQueries(...args),
    }),
  };
});

const mockFetchTestsFromSupabase = vi.fn();
const mockUpsertTestToSupabase = vi.fn();

vi.mock('@/src/features/exam/src/services/exam.supabase', () => ({
  fetchTestsFromSupabase: (...args: any[]) => mockFetchTestsFromSupabase(...args),
  upsertTestToSupabase: (...args: any[]) => mockUpsertTestToSupabase(...args),
}));

let mockHasSupabaseEnvFn = vi.fn(() => true);
vi.mock('@/src/lib/supabase', () => ({
  hasSupabaseEnv: (...args: any[]) => mockHasSupabaseEnvFn(...args),
  missingSupabaseEnvMessage: 'Missing Supabase environment variables',
}));

describe('useTestMigration', () => {
  beforeEach(() => {
    testQueryClient.clear();
    localStorage.clear();
    supabaseStorage.currentUserId = null;
    supabaseStorage.cachedTests = [];
    localStorageTestStorage.currentUserId = null;
    vi.clearAllMocks();
    mockSetQueryData.mockClear();
    mockInvalidateQueries.mockClear();
    mockHasSupabaseEnvFn.mockReturnValue(true);
    mockFetchTestsFromSupabase.mockClear();
    mockUpsertTestToSupabase.mockClear();
  });

  it('does nothing when no local tests exist', async () => {
    const { rerender } = renderHook(
      ({ userId, envMissing }: { userId: string | null; envMissing: boolean }) =>
        useTestMigration({ userId, envMissing }),
      { wrapper: TestWrapper, initialProps: { userId: null, envMissing: false } }
    );
    await act(async () => {
      await new Promise(r => setTimeout(r, 50));
    });
    rerender({ userId: 'user-1', envMissing: false });
    await act(async () => {
      await new Promise(r => setTimeout(r, 50));
    });
    expect(mockFetchTestsFromSupabase).not.toHaveBeenCalled();
  });

  it('migrates local tests to Supabase on first login', async () => {
    const localTests = [buildTest({ id: 'local-1' }), buildTest({ id: 'local-2' })];
    localStorageTestStorage.saveTest(localTests[0]);
    localStorageTestStorage.saveTest(localTests[1]);

    mockFetchTestsFromSupabase.mockResolvedValue({ data: [], error: null });

    const { rerender } = renderHook(
      ({ userId, envMissing }: { userId: string | null; envMissing: boolean }) =>
        useTestMigration({ userId, envMissing }),
      { wrapper: TestWrapper, initialProps: { userId: null, envMissing: false } }
    );
    await act(async () => {
      await new Promise(r => setTimeout(r, 50));
    });
    rerender({ userId: 'user-1', envMissing: false });
    await act(async () => {
      await new Promise(r => setTimeout(r, 100));
    });

    expect(mockFetchTestsFromSupabase).toHaveBeenCalledWith('user-1');
    expect(mockUpsertTestToSupabase).toHaveBeenCalledTimes(2);
  });

  it('skips upsert for tests that already exist on server', async () => {
    const localTest = buildTest({ id: 'local-1' });
    const serverTest = buildTest({ id: 'server-1', title: 'سيرفر' });
    localStorageTestStorage.saveTest(localTest);
    supabaseStorage.hydrateFromServer('user-1', [serverTest]);

    mockFetchTestsFromSupabase.mockResolvedValue({ data: [serverTest], error: null });

    const { rerender } = renderHook(
      ({ userId, envMissing }: { userId: string | null; envMissing: boolean }) =>
        useTestMigration({ userId, envMissing }),
      { wrapper: TestWrapper, initialProps: { userId: null, envMissing: false } }
    );
    await act(async () => {
      await new Promise(r => setTimeout(r, 50));
    });
    rerender({ userId: 'user-1', envMissing: false });
    await act(async () => {
      await new Promise(r => setTimeout(r, 100));
    });

    expect(mockUpsertTestToSupabase).toHaveBeenCalledTimes(1);
    expect(mockUpsertTestToSupabase).toHaveBeenCalledWith(expect.objectContaining({ id: 'local-1' }));
  });

  it('invalidates queries on server fetch error', async () => {
    localStorageTestStorage.saveTest(buildTest({ id: 'local-1' }));
    mockFetchTestsFromSupabase.mockResolvedValue({ data: null, error: { message: 'network' } });

    const { rerender } = renderHook(
      ({ userId, envMissing }: { userId: string | null; envMissing: boolean }) =>
        useTestMigration({ userId, envMissing }),
      { wrapper: TestWrapper, initialProps: { userId: null, envMissing: false } }
    );
    await act(async () => {
      await new Promise(r => setTimeout(r, 50));
    });
    rerender({ userId: 'user-1', envMissing: false });
    await act(async () => {
      await new Promise(r => setTimeout(r, 100));
    });

    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['tests', 'user-1'] });
  });

  it('does not run when Supabase env is missing', async () => {
    mockHasSupabaseEnvFn.mockReturnValue(false);
    localStorageTestStorage.saveTest(buildTest({ id: 'local-1' }));

    const { rerender } = renderHook(
      ({ userId, envMissing }: { userId: string | null; envMissing: boolean }) =>
        useTestMigration({ userId, envMissing }),
      { wrapper: TestWrapper, initialProps: { userId: null, envMissing: true } }
    );
    await act(async () => {
      await new Promise(r => setTimeout(r, 50));
    });
    rerender({ userId: 'user-1', envMissing: true });
    await act(async () => {
      await new Promise(r => setTimeout(r, 50));
    });

    expect(mockFetchTestsFromSupabase).not.toHaveBeenCalled();
  });
});
