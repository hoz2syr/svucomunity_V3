import { describe, it, expect, beforeEach } from 'vitest';
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

describe('LocalFirstTestStorage', () => {
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

  it('hydrateFromServer merges local and server data', () => {
    storage.saveTest(buildTest({ id: 'local' }));
    const serverTests = [buildTest({ id: 'server' })];
    storage.hydrateFromServer('user-1', serverTests);
    expect(storage.getTests()).toHaveLength(2);
    const ids = storage.getTests().map(t => t.id);
    expect(ids).toContain('local');
    expect(ids).toContain('server');
  });

  it('manages current user id', () => {
    expect(storage.getCurrentUserId()).toBeNull();
    storage.setCurrentUserId('user-1');
    expect(storage.getCurrentUserId()).toBe('user-1');
    storage.setCurrentUserId(null);
    expect(storage.getCurrentUserId()).toBeNull();
  });
});
