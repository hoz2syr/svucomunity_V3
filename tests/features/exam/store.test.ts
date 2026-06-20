import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getTests, saveTest, deleteTest, getTestById, rateTest, getRatedSessions, markTestRatedInSession } from '@/src/features/exam/src/lib/store';

const MOCK_KEY = 'svu_tests_db';
const RATING_KEY = 'svu_tests_rated_sessions';

describe('exam store', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('returns empty array when storage is empty', () => {
    expect(getTests()).toEqual([]);
  });

  it('saves and retrieves a test', () => {
    const test = {
      id: '1',
      title: 'اختبار 1',
      description: 'وصف',
      createdAt: Date.now(),
      settings: { showExplanations: true },
      questions: [],
    };
    saveTest(test);
    const loaded = getTests();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].title).toBe('اختبار 1');
  });

  it('updates existing test by id (upsert)', () => {
    saveTest({ id: '1', title: 'أول', description: '', createdAt: Date.now(), settings: { showExplanations: true }, questions: [] });
    saveTest({ id: '1', title: 'محدث', description: '', createdAt: Date.now(), settings: { showExplanations: false }, questions: [] });
    expect(getTests()).toHaveLength(1);
    expect(getTests()[0].title).toBe('محدث');
  });

  it('deletes a test by id', () => {
    saveTest({ id: '1', title: 'أول', description: '', createdAt: Date.now(), settings: { showExplanations: true }, questions: [] });
    saveTest({ id: '2', title: 'ثاني', description: '', createdAt: Date.now(), settings: { showExplanations: true }, questions: [] });
    deleteTest('1');
    expect(getTests()).toHaveLength(1);
    expect(getTests()[0].id).toBe('2');
  });

  it('getTestById returns undefined for missing id', () => {
    expect(getTestById('غير موجود')).toBeUndefined();
  });

  it('getTestById returns matching test', () => {
    saveTest({ id: 'abc', title: 'موجود', description: '', createdAt: Date.now(), settings: { showExplanations: true }, questions: [] });
    expect(getTestById('abc')?.title).toBe('موجود');
  });

  it('survives parse errors and returns empty array', () => {
    localStorage.setItem(MOCK_KEY, 'not-valid-json{{{');
    expect(getTests()).toEqual([]);
  });
});

describe('rateTest anti-cheat', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const makeTest = (overrides = {}) => ({
    id: 'test-1',
    title: 'اختبار',
    description: '',
    createdAt: Date.now(),
    settings: { showExplanations: true },
    questions: [{ id: 'q1', type: 'multiple_choice', text: 'س', options: ['أ', 'ب'], correctAnswer: 'أ' }],
    ...overrides,
  });

  it('rejects rating outside 1-5', () => {
    saveTest(makeTest());
    expect(rateTest('test-1', 0).success).toBe(false);
    expect(rateTest('test-1', 6).success).toBe(false);
    expect(rateTest('test-1', 3.5).success).toBe(false);
    expect(rateTest('test-1', 3).success).toBe(true);
  });

  it('rejects rating when no test found', () => {
    expect(rateTest('unknown', 5).success).toBe(false);
  });

  it('calculates average rating on multiple submissions (session protected)', () => {
    saveTest(makeTest());
    expect(rateTest('test-1', 4, 1, 1).success).toBe(true);
    expect(getTests()[0].rating).toBe(4);

    expect(rateTest('test-1', 5, 2, 2).success).toBe(false);
    expect(getTests()[0].rating).toBe(4);

    expect((getRatedSessions()['test-1'])).toBe(true);
  });

  it('refuses rating from a second session attempt', () => {
    saveTest(makeTest());
    markTestRatedInSession('test-1');
    expect(rateTest('test-1', 5, 1, 1).success).toBe(false);
  });

  it('warns and blocks rating before answering any question', () => {
    saveTest(makeTest());
    const result = rateTest('test-1', 5, 0, 1);
    expect(result.success).toBe(false);
  });

  it('warns but allows partial completion with confirmation', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    saveTest(makeTest());
    const result = rateTest('test-1', 4, 1, 2);
    expect(result.success).toBe(true);
    expect(getTests()[0].rating).toBe(4);
    confirmSpy.mockRestore();
  });

  it('blocks if user declines partial completion confirmation', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    saveTest(makeTest());
    const result = rateTest('test-1', 4, 1, 2);
    expect(result.success).toBe(false);
    confirmSpy.mockRestore();
  });

  it('marks ratedBySession on successful rate', () => {
    saveTest(makeTest());
    rateTest('test-1', 5, 1, 1);
    expect(getTests()[0].ratedBySession).toBe(true);
  });
});
