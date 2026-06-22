import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { usePublishedTests } from '@/src/features/exam/src/hooks/usePublishedTests';
import type { TestModel } from '@/src/features/exam/src/types';

const buildTest = (overrides: Partial<TestModel> = {}): TestModel => ({
  id: 'pub-1',
  title: 'اختبار منشور',
  description: 'وصف',
  createdAt: Date.now(),
  settings: { showExplanations: true },
  questions: [],
  published: true,
  ...overrides,
});

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

vi.mock('@/src/lib/supabase', () => {
  const mock: any = {
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => ({
            order: () => ({
              limit: async () => ({ data: [], error: null }),
            }),
          }),
        }),
      }),
    }),
  };
  return {
    hasSupabaseEnv: () => true,
    getSupabaseClient: () => mock,
    missingSupabaseEnvMessage: 'missing',
    __setMock: (m: any) => { Object.assign(mock, m); },
  };
});

describe('usePublishedTests', () => {
  beforeEach(() => {
    queryClient.clear();
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('starts with empty tests and loading true', async () => {
    const mod = await import('@/src/lib/supabase');
    (mod as any).__setMock({
      from: () => ({
        select: () => ({
          eq: () => ({
            order: () => ({
              order: () => ({
                limit: async () => ({ data: [], error: null }),
              }),
            }),
          }),
        }),
      }),
    });

    const { result } = renderHook(() => usePublishedTests(), { wrapper });
    expect(result.current.tests).toEqual([]);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('returns published tests when fetch succeeds', async () => {
    const tests = [
      buildTest({ id: 'pub-1', title: 'اختبار 1' }),
      buildTest({ id: 'pub-2', title: 'اختبار 2' }),
    ];

    const mod = await import('@/src/lib/supabase');
    (mod as any).__setMock({
      from: () => ({
        select: () => ({
          eq: () => ({
            order: () => ({
              order: () => ({
                limit: async () => ({ data: tests, error: null }),
              }),
            }),
          }),
        }),
      }),
    });

    const { result } = renderHook(() => usePublishedTests(), { wrapper });

    await act(async () => {
      await new Promise(r => setTimeout(r, 50));
    });

    expect(result.current.tests).toHaveLength(2);
    expect(result.current.tests[0].title).toBe('اختبار 1');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('exposes hasNextPage and fetchNextPage', async () => {
    const tests = [buildTest({ id: 'pub-1' })];

    const mod = await import('@/src/lib/supabase');
    (mod as any).__setMock({
      from: () => ({
        select: () => ({
          eq: () => ({
            order: () => ({
              order: () => ({
                limit: async () => ({ data: tests, error: null }),
              }),
            }),
          }),
        }),
      }),
    });

    const { result } = renderHook(() => usePublishedTests(), { wrapper });

    await act(async () => {
      await new Promise(r => setTimeout(r, 50));
    });

    expect(result.current.hasNextPage).toBe(false);
    expect(typeof result.current.fetchNextPage).toBe('function');
    expect(typeof result.current.refetch).toBe('function');
  });

  it('sets error when fetch returns error', async () => {
    const mod = await import('@/src/lib/supabase');
    (mod as any).__setMock({
      from: () => ({
        select: () => ({
          eq: () => ({
            order: () => ({
              order: () => ({
                limit: async () => ({ data: null, error: { message: 'DB error' } }),
              }),
            }),
          }),
        }),
      }),
    });

    const { result } = renderHook(() => usePublishedTests(), { wrapper });

    await act(async () => {
      await new Promise(r => setTimeout(r, 50));
    });

    expect(result.current.error).toBe('DB error');
    expect(result.current.tests).toEqual([]);
  });
});
