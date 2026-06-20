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
  it('toTestRow maps description and rating nullability and sets published false', () => {
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
      published: false,
    });
  });

  it('toTestRow preserves description and rating when provided', () => {
    const test = buildTest({ description: 'وصف', rating: 4 });
    const row = toTestRow(test);
    expect(row.description).toBe('وصف');
    expect(row.rating).toBe(4);
  });

  it('toTestRow always sets published to false', () => {
    const test = buildTest({ published: true });
    const row = toTestRow(test);
    expect(row.published).toBe(false);
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
