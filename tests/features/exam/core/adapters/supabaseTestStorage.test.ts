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

  it('throws on direct reads without hydration', () => {
    expect(() => storage.getTests()).toThrow('SupabaseTestStorage does not support direct local reads');
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
    await Promise.resolve(); // allow fire-and-forget promise
    expect(mockUpsert).toHaveBeenCalledWith({ ...test, userId: 'user-1' });
  });

  it('deleteTest forwards to deleteTestFromSupabase', async () => {
    mockDelete.mockResolvedValue({ error: null });
    storage.setCurrentUserId('user-1');
    storage.deleteTest('t1');
    await Promise.resolve();
    expect(mockDelete).toHaveBeenCalledWith({ testId: 't1', userId: 'user-1' });
  });
});
