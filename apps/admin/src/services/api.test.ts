import { vi } from 'vitest';
vi.mock('@svu-community/supabase-client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { getStats } from '../services/api';
import { supabase } from '@svu-community/supabase-client';

const mockSupabase = supabase as unknown as {
  from: ReturnType<typeof vi.fn>;
};

describe('api.getStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns aggregated stats with growth calculations', async () => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'users') {
        return {
          select: (column: string, opts?: Record<string, unknown>) => {
            if (column === '*' && opts?.head) {
              return Promise.resolve({ count: 100, error: null });
            }
            if (opts?.gte && opts?.lt) {
              return Promise.resolve({ count: 80, error: null });
            }
            return Promise.resolve({ count: 100, error: null });
          },
        };
      }
      if (table === 'courses') {
        return {
          select: (column: string, opts?: Record<string, unknown>) => {
            if (opts?.head) return Promise.resolve({ count: 30, error: null });
            if (opts?.gte) return Promise.resolve({ count: 10, error: null });
            if (opts?.lt) return Promise.resolve({ count: 20, error: null });
            return Promise.resolve({ count: 30, error: null });
          },
        };
      }
      if (table === 'study_groups') {
        return {
          select: (column: string, opts?: Record<string, unknown>) => {
            if (opts?.head) return Promise.resolve({ count: 50, error: null });
            if (opts?.gte) return Promise.resolve({ count: 15, error: null });
            if (opts?.lt) return Promise.resolve({ count: 35, error: null });
            return Promise.resolve({ count: 50, error: null });
          },
        };
      }
      return { select: () => Promise.resolve({ count: 0, error: null }) };
    });

    const stats = await getStats();

    expect(stats.users).toBe(100);
    expect(stats.courses).toBe(30);
    expect(stats.groups).toBe(50);
    expect(stats.newRegistrationsThisWeek).toBe(100);
    expect(typeof stats.usersGrowth).toBe('number');
    expect(typeof stats.coursesGrowth).toBe('number');
    expect(typeof stats.groupsGrowth).toBe('number');
    expect(typeof stats.registrationsGrowth).toBe('number');
  });

  it('throws on database error', async () => {
    mockSupabase.from.mockReturnValue({
      select: () => Promise.resolve({ count: null, error: { message: 'DB error' } }),
    });

    await expect(getStats()).rejects.toThrow('Failed to fetch dashboard stats');
  });
});
