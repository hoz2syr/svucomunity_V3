"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import type { TestModel } from '../types';
import { localStorageTestStorage } from '../core/adapters/localStorageTestStorage';
import { supabaseStorage } from '../core/adapters/supabaseTestStorage';
import { useAuth } from '@/src/contexts/AuthContext';
import { fetchTestsPage, upsertTestToSupabase, deleteTestFromSupabase } from '../services/exam.supabase';
import { hasSupabaseEnv } from '@/src/lib/supabase';
import { useTestActions } from './useTestActions';
import { useTestMigration } from './useTestMigration';

export interface UseSavedTestsReturn {
  tests: TestModel[];
  loadingPdf: string | null;
  isLoading: boolean;
  error: string | null;
  canDelete: boolean;
  confirmDeleteId: string | null;
  isDeleting: boolean;
  fetchTests: () => Promise<void>;
  requestDelete: (id: string) => void;
  executeDelete: () => Promise<void>;
  cancelDelete: () => void;
  handlePrintPdf: (test: TestModel) => Promise<void>;
  handleExportWord: (test: TestModel) => Promise<void>;
  handlePublish: (testId: string) => Promise<void>;
  publishingId: string | null;
  publishError: string | null;
  fetchNextPage: () => Promise<void>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}

const PAGE_LIMIT = 9;

export function useCoreSavedTests(): UseSavedTestsReturn {
  const queryClient = useQueryClient();
  const { session, loading: authLoading, envMissing } = useAuth();
  const userId = session?.user?.id ?? null;
  const storage = userId ? supabaseStorage : localStorageTestStorage;
  const canDelete = !!userId;

  const [tests, setTests] = useState<TestModel[]>([]);
  const [isLoadingState, setIsLoading] = useState(true);
  const [errorState, setError] = useState<string | null>(null);

  useTestMigration({ userId, envMissing });

  const {
    data,
    fetchNextPage: fetchNextPageRaw,
    hasNextPage,
    isFetchingNextPage,
    isLoading: queryLoading,
    error: queryError,
    refetch,
  } = useInfiniteQuery<TestModel[]>({
    queryKey: ['tests', userId],
    initialPageParam: undefined,
    queryFn: async ({ pageParam }): Promise<TestModel[]> => {
      if (!userId) return [];
      const cursor = pageParam as { created_at: string; id: string } | undefined;
      const { data, error } = await fetchTestsPage(userId, cursor, PAGE_LIMIT);
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.length === 0) return undefined;
      if (lastPage.length < PAGE_LIMIT) return undefined;
      const last = lastPage[lastPage.length - 1];
      return { created_at: new Date(last.createdAt).toISOString(), id: last.id } as { created_at: string; id: string };
    },
    enabled: !!userId && !envMissing,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });

  const serverTests = useMemo(() => (data?.pages.flat() as TestModel[]) ?? [], [data]);

  useEffect(() => {
    if (!userId || envMissing) {
      setTests(localStorageTestStorage.getTests());
      setIsLoading(false);
      setError(null);
      return;
    }
    if (serverTests) {
      supabaseStorage.hydrateFromServer(userId, serverTests);
      setTests(serverTests);
      setIsLoading(false);
      setError(null);
    }
  }, [serverTests, userId, envMissing]);

  useEffect(() => {
    if (queryError) {
      const message = queryError instanceof Error ? queryError.message : String(queryError);
      setError(message || 'تعذر جلب الاختبارات المحفوظة.');
      setIsLoading(false);
    }
  }, [queryError]);

  const fetchTests = useCallback(async () => {
    if (!userId || envMissing) {
      setTests(localStorageTestStorage.getTests());
      setIsLoading(false);
      setError(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    await refetch();
  }, [userId, refetch, envMissing]);

  const handlePublish = useCallback(async (testId: string) => {
    const currentTests = storage.getTests();
    const existing = currentTests.find(t => t.id === testId);
    if (!existing) {
      throw new Error('الاختبار غير موجود');
    }

    const updated: TestModel = {
      ...existing,
      published: true,
      publishedAt: existing.publishedAt ?? new Date().toISOString(),
    };

    storage.saveTest(updated);
    setTests(currentTests.map(t => (t.id === testId ? updated : t)));

    if (userId && hasSupabaseEnv() && !envMissing) {
      await upsertTestToSupabase({ ...updated, userId });
      queryClient.invalidateQueries({ queryKey: ['tests', userId] });
    }
  }, [userId, queryClient, storage, envMissing]);

  const executeDelete = useCallback(async (id: string) => {
    localStorageTestStorage.deleteTest(id);
    if (userId && hasSupabaseEnv() && !envMissing) {
      await deleteTestFromSupabase({ testId: id, userId });
    }
    const remaining = localStorageTestStorage.getTests();
    setTests(remaining);
    queryClient.setQueryData<TestModel[][]>(['tests', userId], (old) => {
      if (!old) return old;
      return old.map((page: TestModel[]) => page.filter((t) => t.id !== id));
    });
  }, [userId, queryClient, envMissing]);

  const actions = useTestActions({
    onPublish: handlePublish,
    onDelete: executeDelete,
  });

  return {
    tests,
    loadingPdf: actions.loadingPdf,
    isLoading: isLoadingState || authLoading || queryLoading,
    error: errorState,
    canDelete,
    confirmDeleteId: actions.confirmDeleteId,
    isDeleting: actions.isDeleting,
    fetchTests,
    requestDelete: actions.requestDelete,
    executeDelete: actions.executeDelete,
    cancelDelete: actions.cancelDelete,
    handlePrintPdf: actions.handlePrintPdf,
    handleExportWord: actions.handleExportWord,
    handlePublish: actions.handlePublish,
    publishingId: actions.publishingId,
    publishError: actions.publishError,
    fetchNextPage: async () => {
      await fetchNextPageRaw();
    },
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage: isFetchingNextPage ?? false,
  };
}
