import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocalFirstTestStorage } from '@/src/features/exam/src/core/storage/localStorageTestStorage';
import type { TestModel } from '@/src/features/exam/src/types';

const buildTest = (overrides: Partial<TestModel> = {}): TestModel => ({
  id: 'test-1',
  title: 'اختبار',
  description: 'وصف',
  createdAt: Date.now(),
  settings: { showExplanations: true },
  questions: [],
  ...overrides,
});

describe('core/storage LocalFirstTestStorage', () => {
  let storage: LocalFirstTestStorage;

  beforeEach(() => {
    storage = new LocalFirstTestStorage();
    localStorage.clear();
  });

  it('returns empty array when nothing stored', () => {
    expect(storage.getTests()).toEqual([]);
  });

  it('persists and retrieves tests', () => {
    const test = buildTest({ id: 't1' });
    storage.saveTest(test);
    expect(storage.getTests()).toHaveLength(1);
    expect(storage.getTests()[0].id).toBe('t1');
  });

  it('updates existing test by id', () => {
    storage.saveTest(buildTest({ id: 't1', title: 'أول' }));
    storage.saveTest(buildTest({ id: 't1', title: 'ثانٍ' }));
    expect(storage.getTests()).toHaveLength(1);
    expect(storage.getTests()[0].title).toBe('ثانٍ');
  });

  it('deletes test by id', () => {
    storage.saveTest(buildTest({ id: 't1' }));
    storage.saveTest(buildTest({ id: 't2' }));
    storage.deleteTest('t1');
    expect(storage.getTests()).toHaveLength(1);
    expect(storage.getTests()[0].id).toBe('t2');
  });

  it('getTestById returns test or undefined', () => {
    storage.saveTest(buildTest({ id: 't1' }));
    expect(storage.getTestById('t1')?.id).toBe('t1');
    expect(storage.getTestById('missing')).toBeUndefined();
  });

  it('survives getTests JSON parse failure', () => {
    localStorage.setItem('svu_tests_db', 'not-valid-json{{{');
    expect(storage.getTests()).toEqual([]);
  });

  it('manages current user id with persistence', () => {
    expect(storage.getCurrentUserId()).toBeNull();
    storage.setCurrentUserId('user-1');
    expect(localStorage.getItem('svu_tests_current_user')).toBe(JSON.stringify('user-1'));
    expect(storage.getCurrentUserId()).toBe('user-1');
    storage.setCurrentUserId(null);
    expect(localStorage.getItem('svu_tests_current_user')).toBeNull();
    expect(storage.getCurrentUserId()).toBeNull();
  });

  it('survives corrupt currentUser JSON in getCurrentUserId', () => {
    localStorage.setItem('svu_tests_current_user', 'not-json');
    const inst = new LocalFirstTestStorage();
    expect(inst.getCurrentUserId()).toBeNull();
  });

  it('hydrateFromServer merges server and local tests', () => {
    storage.saveTest(buildTest({ id: 'local' }));
    const serverTests = [buildTest({ id: 'server' })];
    storage.hydrateFromServer('user-1', serverTests);
    const all = storage.getTests();
    const ids = all.map(t => t.id).sort();
    expect(ids).toEqual(['local', 'server']);
    expect(localStorage.getItem('svu_tests_synced:user-1')).toBe('1');
    expect(localStorage.getItem('svu_tests_current_user')).toBe(JSON.stringify('user-1'));
  });

  it('hydrateFromServer keeps local when server has no conflicting ids', () => {
    storage.saveTest(buildTest({ id: 'only-local' }));
    storage.hydrateFromServer('user-1', []);
    expect(storage.getTests()).toHaveLength(1);
    expect(storage.getTests()[0].id).toBe('only-local');
  });

  it('enqueuePending deduplicates by id', () => {
    storage.setCurrentUserId('user-1');
    const t1 = buildTest({ id: 't1' });
    const t2 = buildTest({ id: 't2' });
    storage.saveTest(t1);
    storage.saveTest(t1);
    storage.saveTest(t2);
    const raw = localStorage.getItem('svu_tests_pending:user-1');
    expect(raw).not.toBeNull();
    const queue = JSON.parse(raw!) as TestModel[];
    expect(queue).toHaveLength(2);
    expect(queue.map(q => q.id).sort()).toEqual(['t1', 't2']);
  });

  it('enqueuePending skips when userId is null', () => {
    storage.setCurrentUserId(null);
    const rawBefore = localStorage.getItem('svu_tests_pending:user-1');
    storage.saveTest(buildTest({ id: 't1' }));
    const rawAfter = localStorage.getItem('svu_tests_pending:user-1');
    expect(rawAfter).toBe(rawBefore);
  });

  it('getPendingSyncCount returns correct count', () => {
    storage.setCurrentUserId('user-1');
    expect(storage.getPendingSyncCount('user-1')).toBe(0);
    storage.saveTest(buildTest({ id: 't1' }));
    expect(storage.getPendingSyncCount('user-1')).toBe(1);
  });

  it('getPendingSyncCount returns 0 on corrupt queue', () => {
    storage.setCurrentUserId('user-1');
    localStorage.setItem('svu_tests_pending:user-1', 'not-json');
    expect(storage.getPendingSyncCount('user-1')).toBe(0);
  });

  it('drainPendingSync processes queue and removes key', async () => {
    storage.setCurrentUserId('user-1');
    const processed: TestModel[] = [];
    storage.saveTest(buildTest({ id: 't1', title: 'أول' }));
    storage.saveTest(buildTest({ id: 't2', title: 'ثانٍ' }));
    await storage.drainPendingSync(async (test) => {
      processed.push(test);
    });
    expect(processed).toHaveLength(2);
    expect(processed.map(t => t.id).sort()).toEqual(['t1', 't2']);
    expect(localStorage.getItem('svu_tests_pending:user-1')).toBeNull();
  });

  it('drainPendingSync no-ops when userId is null', async () => {
    storage.setCurrentUserId(null);
    const processed: TestModel[] = [];
    await storage.drainPendingSync(async (test) => processed.push(test));
    expect(processed).toHaveLength(0);
  });

  it('syncToServer is a no-op', () => {
    expect(() => storage.syncToServer(buildTest())).not.toThrow();
  });
});
