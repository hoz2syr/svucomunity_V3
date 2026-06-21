import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseTestStorage } from '@/src/features/exam/src/core/adapters/supabaseTestStorage';

const mockUpsert = vi.fn();
const mockDelete = vi.fn();

vi.mock('@/src/features/exam/src/services/exam.supabase', () => ({
  upsertTestToSupabase: (...args: unknown[]) => mockUpsert(...args),
  deleteTestFromSupabase: (...args: unknown[]) => mockDelete(...args),
}));

describe('SupabaseTestStorage', () => {
  let storage: SupabaseTestStorage;

  beforeEach(() => {
    storage = new SupabaseTestStorage();
    mockUpsert.mockClear();
    mockDelete.mockClear();
  });

  it('returns empty array on getTests before hydration', () => {
    expect(storage.getTests()).toEqual([]);
  });

  it('hydrateFromServer populates getTests with server data', () => {
    const serverTests = [
      { id: 's1', title: 'Server Test', createdAt: 1, settings: { showExplanations: true }, questions: [] },
    ];
    storage.hydrateFromServer('user-1', serverTests as any);
    expect(storage.getTests()).toHaveLength(1);
    expect(storage.getTests()[0].id).toBe('s1');
  });

  it('hydrateFromServer sets the current userId', () => {
    storage.hydrateFromServer('user-1', []);
    expect(storage.getCurrentUserId()).toBe('user-1');
  });

  it('getTestById finds a hydrated test', () => {
    const serverTests = [
      { id: 's1', title: 'Server Test', createdAt: 1, settings: { showExplanations: true }, questions: [] },
    ];
    storage.hydrateFromServer('user-1', serverTests as any);
    expect(storage.getTestById('s1')?.title).toBe('Server Test');
    expect(storage.getTestById('missing')).toBeUndefined();
  });

  it('hydrateFromServer replaces previous cached tests', () => {
    storage.hydrateFromServer('user-1', [{ id: 'old', createdAt: 1, settings: { showExplanations: true }, questions: [] }] as any);
    storage.hydrateFromServer('user-1', [{ id: 'new', createdAt: 2, settings: { showExplanations: true }, questions: [] }] as any);
    expect(storage.getTests()).toHaveLength(1);
    expect(storage.getTests()[0].id).toBe('new');
  });

  it('saveTest rejects when userId not set', () => {
    expect(() => storage.saveTest({ id: 't1', title: 'x', createdAt: 1, settings: { showExplanations: true }, questions: [] })).toThrow('Cannot sync to Supabase without userId');
  });

  it('deleteTest rejects when userId not set', () => {
    expect(() => storage.deleteTest('t1')).toThrow('Cannot delete from Supabase without userId');
  });

  it('saveTest forwards to upsertTestToSupabase', async () => {
    mockUpsert.mockResolvedValue({ error: null });
    storage.setCurrentUserId('user-1');
    const test = { id: 't1', title: 'x', createdAt: 1, settings: { showExplanations: true }, questions: [] } as const;
    storage.saveTest(test as any);
    await Promise.resolve();
    expect(mockUpsert).toHaveBeenCalledWith({ ...test, userId: 'user-1' });
  });

  it('deleteTest forwards to deleteTestFromSupabase and removes from cache', async () => {
    mockDelete.mockResolvedValue({ error: null });
    storage.hydrateFromServer('user-1', [
      { id: 't1', title: 'x', createdAt: 1, settings: { showExplanations: true }, questions: [] },
      { id: 't2', createdAt: 2, settings: { showExplanations: true }, questions: [] },
    ] as any);
    storage.setCurrentUserId('user-1');
    storage.deleteTest('t1');
    await Promise.resolve();
    expect(mockDelete).toHaveBeenCalledWith({ testId: 't1', userId: 'user-1' });
    expect(storage.getTests()).toHaveLength(1);
    expect(storage.getTests()[0].id).toBe('t2');
  });
});
