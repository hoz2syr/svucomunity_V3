import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCourseResources } from '../hooks/useCourseResources';

vi.mock('../services/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => ({
            then: (resolve: (v: { data: never[]; error: null; status: number }) => void) => resolve({ data: [], error: null, status: 200 }),
          }),
        }),
      }),
    }),
  },
}));

describe('useCourseResources', () => {
  beforeEach(() => { vi.useFakeTimers(); });

  afterEach(() => { vi.useRealTimers(); });

  it('starts with loading=false and empty resources', () => {
    const { result } = renderHook(() => useCourseResources('CS101'));
    expect(result.current.loading).toBe(false);
    expect(result.current.resources).toEqual([]);
  });

  it('loads resources then sets loading=false', async () => {
    const { result } = renderHook(() => useCourseResources('CS101'));
    await act(async () => { vi.advanceTimersByTime(100); });
    expect(result.current.loading).toBe(false);
    expect(result.current.resources).toEqual([]);
  });
});
