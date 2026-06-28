import { describe, it, expect, beforeEach, vi } from 'vitest';
import { toTestRow, toTestModel } from '@/src/features/exam/src/services/exam.supabase';
import type { TestModel } from '@/src/features/exam/src/types';

const buildTest = (overrides: Partial<TestModel> = {}): TestModel => ({
  id: 'test-1',
  title: 'اختبار',
  description: 'وصف',
  createdAt: Date.now(),
  settings: { showExplanations: true },
  questions: [],
  published: false,
  rating: undefined,
  userId: 'user-1',
  ...overrides,
});

describe('exam.supabase mappers', () => {
  it('toTestRow maps description and rating nullability and preserves published', () => {
    const test = buildTest({ description: undefined, rating: undefined, published: true });
    const row = toTestRow(test);
    expect(row).toEqual({
      id: 'test-1',
      user_id: 'user-1',
      title: 'اختبار',
      description: null,
      settings: { showExplanations: true },
      questions: [],
      rating: null,
      published: true,
    });
  });

  it('toTestRow preserves description and rating when provided', () => {
    const test = buildTest({ description: 'وصف', rating: 4 });
    const row = toTestRow(test);
    expect(row.description).toBe('وصف');
    expect(row.rating).toBe(4);
  });

  it('toTestRow preserves published flag instead of forcing false', () => {
    const test = buildTest({ published: true });
    const row = toTestRow(test);
    expect(row.published).toBe(true);
  });

  it('toTestModel maps row to TestModel with Date.parse for createdAt', () => {
    const ts = Date.now();
    const row = {
      id: 't1',
      user_id: 'user-1',
      title: 'اختبار',
      description: 'وصف',
      settings: { showExplanations: true } as TestModel['settings'],
      questions: [] as TestModel['questions'],
      rating: 4,
      published: true,
      created_at: new Date(ts).toISOString(),
      updated_at: new Date(ts).toISOString(),
    };
    const model = toTestModel(row);
    expect(model.id).toBe('t1');
    expect(model.createdAt).toBeCloseTo(ts, -3);
    expect(model.description).toBe('وصف');
    expect(model.rating).toBe(4);
    expect(model.published).toBe(true);
  });

  it('toTestModel falls back description and rating to undefined', () => {
    const row = {
      id: 't1',
      user_id: 'user-1',
      title: 'اختبار',
      description: null,
      settings: { showExplanations: true } as TestModel['settings'],
      questions: [] as TestModel['questions'],
      rating: null,
      published: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const model = toTestModel(row);
    expect(model.description).toBeUndefined();
    expect(model.rating).toBeUndefined();
  });
});

describe('fetchTestsPage pagination', () => {
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  });

  it('returns empty data with hasMore=false when env is missing', async () => {
    const { fetchTestsPage: ftp } = await import('@/src/features/exam/src/services/exam.supabase');
    const result = await ftp('user-1', undefined, 9);
    expect(result.data).toEqual([]);
    expect(result.hasMore).toBe(false);
    expect(result.nextCursor).toBeUndefined();
  });

  it('returns hasMore=false and no cursor when fewer than limit', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://x.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'k';

    const now = Date.now();
    const rows = Array.from({ length: 3 }, (_, i) => ({
      id: `t${i}`, user_id: 'user-1', title: `t${i}`,
      description: null, settings: {} as TestModel['settings'],
      questions: [] as TestModel['questions'], rating: null, published: false,
      created_at: new Date(now - i * 1000).toISOString(),
      updated_at: new Date(now - i * 1000).toISOString(),
    }));

    vi.mock('@/src/lib/supabase', () => {
      const mock: any = { from: () => ({ select: () => ({ eq: () => ({ order: () => ({ order: () => ({ limit: async () => ({ data: [], error: null }) }) }) }) }) }) };
      return {
        hasSupabaseEnv: () => true,
        getSupabaseClient: () => mock,
        missingSupabaseEnvMessage: 'missing',
        __setMock: (m: any) => { Object.assign(mock, m); },
      };
    });

    const mod = await import('@/src/lib/supabase');
    (mod as any).__setMock({
      from: () => ({
        select: () => ({
          eq: () => ({
            order: () => ({
              order: () => ({
                limit: async () => ({ data: rows, error: null }),
              }),
            }),
          }),
        }),
      }),
    });

    const { fetchTestsPage: ftp } = await import('@/src/features/exam/src/services/exam.supabase');
    const result = await ftp('user-1', undefined, 9);
    expect(result.data).toHaveLength(3);
    expect(result.hasMore).toBe(false);
    expect(result.nextCursor).toBeUndefined();
  });
});

describe('fetchPublishedTests', () => {
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  });

  it('returns hasMore=false and no cursor when fewer than limit', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://x.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'k';

    const now = Date.now();
    const rows = Array.from({ length: 3 }, (_, i) => ({
      id: `t${i}`, user_id: 'user-1', title: `t${i}`,
      description: null, settings: {} as TestModel['settings'],
      questions: [] as TestModel['questions'], rating: null, published: true,
      created_at: new Date(now - i * 1000).toISOString(),
      updated_at: new Date(now - i * 1000).toISOString(),
    }));

    vi.mock('@/src/lib/supabase', () => {
      const mock: any = { from: () => ({ select: () => ({ eq: () => ({ order: () => ({ order: () => ({ limit: async () => ({ data: [], error: null }) }) }) }) }) }) };
      return {
        hasSupabaseEnv: () => true,
        getSupabaseClient: () => mock,
        missingSupabaseEnvMessage: 'missing',
        __setMock: (m: any) => { Object.assign(mock, m); },
      };
    });

    const mod = await import('@/src/lib/supabase');
    (mod as any).__setMock({
      from: () => ({
        select: () => ({
          eq: () => ({
            order: () => ({
              order: () => ({
                limit: async () => ({ data: rows, error: null }),
              }),
            }),
          }),
        }),
      }),
    });

    const { fetchPublishedTests } = await import('@/src/features/exam/src/services/exam.supabase');
    const result = await fetchPublishedTests(9);
    expect(result.data).toHaveLength(3);
    expect(result.hasMore).toBe(false);
    expect(result.nextCursor).toBeUndefined();
  });
});

describe('fetchPublishedTestById strips correctAnswer', () => {
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  });

  it('removes correctAnswer from MCQ questions in public response', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://x.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'k';

    const now = Date.now();
    const rows = [
      {
        id: 'pub-1',
        user_id: 'user-1',
        title: 'اختبار منشور',
        description: 'وصف',
        settings: { showExplanations: true } as TestModel['settings'],
        questions: [
          { id: 'q1', type: 'multiple_choice', text: 'سؤال 1', options: ['أ', 'ب'], correctAnswer: 'ب' },
          { id: 'q2', type: 'true_false', text: 'سؤال 2', correctAnswer: 'true' },
        ],
        rating: 4,
        published: true,
        created_at: new Date(now).toISOString(),
        updated_at: new Date(now).toISOString(),
      },
    ];

    vi.mock('@/src/lib/supabase', () => {
      const mock: any = { from: () => ({ select: () => ({ eq: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }) }) }) };
      return {
        hasSupabaseEnv: () => true,
        getSupabaseClient: () => mock,
        missingSupabaseEnvMessage: 'missing',
        __setMock: (m: any) => { Object.assign(mock, m); },
      };
    });

    const mod = await import('@/src/lib/supabase');
    (mod as any).__setMock({
      from: () => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: rows[0], error: null }),
            }),
          }),
        }),
      }),
    });

    const { fetchPublishedTestById } = await import('@/src/features/exam/src/services/exam.supabase');
    const result = await fetchPublishedTestById('pub-1');

    expect(result.error).toBeNull();
    expect(result.data).not.toBeNull();
    expect(result.data!.questions[0].correctAnswer).toBeUndefined();
    expect(result.data!.questions[1].correctAnswer).toBe('true');
    expect(result.data!.published).toBe(true);
  });
});
