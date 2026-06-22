"use client";

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import type { TestModel } from '../types';
import { fetchPublishedTests } from '../services/exam.supabase';
import { hasSupabaseEnv } from '@/src/lib/supabase';

export interface UsePublishedTestsReturn {
  tests: TestModel[];
  isLoading: boolean;
  error: string | null;
  fetchNextPage: () => Promise<void>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  refetch: () => void;
}

const PAGE_LIMIT = 9;

export function usePublishedTests(): UsePublishedTestsReturn {
  const queryClient = useQueryClient();
  const [errorState, setError] = useState<string | null>(null);

  const {
    data,
    fetchNextPage: fetchNextPageRaw,
    hasNextPage,
    isFetchingNextPage,
    isLoading: queryLoading,
    error: queryError,
  } = useInfiniteQuery<TestModel[]>({
    queryKey: ['published-tests'],
    initialPageParam: undefined,
    queryFn: async ({ pageParam }): Promise<TestModel[]> => {
      const cursor = pageParam as { created_at: string; id: string } | undefined;
      const { data, error } = await fetchPublishedTests(PAGE_LIMIT, cursor);
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.length === 0) return undefined;
      if (lastPage.length < PAGE_LIMIT) return undefined;
      const last = lastPage[lastPage.length - 1];
      return { created_at: new Date(last.createdAt).toISOString(), id: last.id } as { created_at: string; id: string };
    },
    enabled: hasSupabaseEnv(),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });

  const tests = useMemo(() => (data?.pages.flat() as TestModel[]) ?? [], [data]);

  useEffect(() => {
    if (queryError) {
      const message = queryError instanceof Error ? queryError.message : String(queryError);
      setError(message || 'تعذر جلب الاختبارات المنشورة.');
    } else {
      setError(null);
    }
  }, [queryError]);

  const fetchNextPage = useCallback(async () => {
    await fetchNextPageRaw();
  }, [fetchNextPageRaw]);

  const refetchHandler = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['published-tests'] });
  }, [queryClient]);

  return {
    tests,
    isLoading: queryLoading,
    error: errorState,
    fetchNextPage,
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage: isFetchingNextPage ?? false,
    refetch: refetchHandler,
  };
}
