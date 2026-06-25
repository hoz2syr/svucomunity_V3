import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCorePlayTest } from '@/src/features/exam/src/hooks/useCorePlayTest';
import type { TestModel } from '@/src/features/exam/src/types';

const buildTest = (overrides: Partial<TestModel> = {}): TestModel => ({
  id: 'test-1',
  title: 'اختبار',
  description: 'وصف',
  createdAt: Date.now(),
  settings: { showExplanations: true },
  questions: [
    { id: 'q1', type: 'multiple_choice', text: 'سؤال 1', options: ['أ', 'ب'], correctAnswer: 'أ' },
    { id: 'q2', type: 'true_false', text: 'سؤال 2', correctAnswer: 'true' },
  ],
  published: false,
  ...overrides,
});

const mockNavigate = vi.fn();
let mockAuthSession: { user: { id: string } } | null = null;
let mockEnvMissing = false;

vi.mock('@/src/contexts/AuthContext', () => ({
  useAuth: () => ({ session: mockAuthSession, loading: false, envMissing: mockEnvMissing }),
}));

const mockLocalGetTestById = vi.fn();
vi.mock('@/src/features/exam/src/core/storage/localStorageTestStorage', () => ({
  localStorageTestStorage: {
    getTestById: (...args: any[]) => mockLocalGetTestById(...args),
  },
}));

const mockFetchPublishedTestById = vi.fn();
const mockFetchTestByIdFromSupabase = vi.fn();
const mockRateTestInSupabase = vi.fn();
vi.mock('@/src/features/exam/src/services/exam.supabase', () => ({
  fetchPublishedTestById: (...args: any[]) => mockFetchPublishedTestById(...args),
  fetchTestByIdFromSupabase: (...args: any[]) => mockFetchTestByIdFromSupabase(...args),
  rateTestInSupabase: (...args: any[]) => mockRateTestInSupabase(...args),
}));

describe('useCorePlayTest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mockAuthSession = null;
    mockEnvMissing = false;
    mockLocalGetTestById.mockClear();
    mockFetchPublishedTestById.mockClear();
    mockFetchTestByIdFromSupabase.mockClear();
    mockRateTestInSupabase.mockClear();
  });

  it('starts in loading state', () => {
    mockLocalGetTestById.mockReturnValue(undefined);
    const { result } = renderHook(() => useCorePlayTest('test-1', mockNavigate));
    expect(result.current.isLoading).toBe(true);
    expect(result.current.test).toBeNull();
  });

  it('loads local test when available', async () => {
    const test = buildTest();
    mockLocalGetTestById.mockReturnValue(test);
    const { result } = renderHook(() => useCorePlayTest('test-1', mockNavigate));
    await act(async () => {
      await new Promise(r => setTimeout(r, 700));
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.test).toEqual(test);
    expect(result.current.error).toBeNull();
  });

  it('shows error when test not found locally and no auth fallback', async () => {
    mockLocalGetTestById.mockReturnValue(undefined);
    mockAuthSession = null;
    const { result } = renderHook(() => useCorePlayTest('missing', mockNavigate));
    await act(async () => {
      await new Promise(r => setTimeout(r, 700));
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.test).toBeNull();
    expect(result.current.error).not.toBeNull();
  });

  it('falls back to Supabase for authenticated user when local test missing', async () => {
    const serverTest = buildTest({ id: 'remote-1', title: 'اختبار من السيرفر' });
    mockLocalGetTestById.mockReturnValue(undefined);
    mockAuthSession = { user: { id: 'user-1' } };
    mockFetchTestByIdFromSupabase.mockResolvedValue({ data: serverTest, error: null });

    const { result } = renderHook(() => useCorePlayTest('remote-1', mockNavigate));
    await act(async () => {
      await new Promise(r => setTimeout(r, 700));
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.test).toEqual(serverTest);
    expect(mockFetchTestByIdFromSupabase).toHaveBeenCalledWith('remote-1', 'user-1');
  });

  it('loads published test via publicTestId', async () => {
    const published = buildTest({ id: 'pub-1', published: true });
    mockFetchPublishedTestById.mockResolvedValue({ data: published, error: null });
    const { result } = renderHook(() => useCorePlayTest('pub-1', mockNavigate, { publicTestId: 'pub-1' }));
    await act(async () => {
      await new Promise(r => setTimeout(r, 700));
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.test).toEqual(published);
    expect(mockFetchPublishedTestById).toHaveBeenCalledWith('pub-1');
  });

  it('starts timer when hasStarted is set and time limit configured', async () => {
    const test = buildTest({ settings: { showExplanations: true, globalTimeLimitMinutes: 1 } });
    mockLocalGetTestById.mockReturnValue(test);
    const { result } = renderHook(() => useCorePlayTest('test-1', mockNavigate));
    await act(async () => {
      await new Promise(r => setTimeout(r, 700));
    });
    expect(result.current.timeLeft).toBeNull();
    act(() => result.current.setHasStarted(true));
    expect(result.current.timeLeft).toBe(60);
  });

  it('does not start timer when time limit not configured', async () => {
    const test = buildTest({ settings: { showExplanations: true } });
    mockLocalGetTestById.mockReturnValue(test);
    const { result } = renderHook(() => useCorePlayTest('test-1', mockNavigate));
    await act(async () => {
      await new Promise(r => setTimeout(r, 700));
    });
    act(() => result.current.setHasStarted(true));
    expect(result.current.timeLeft).toBeNull();
  });

  it('calculates score correctly', async () => {
    const test = buildTest();
    mockLocalGetTestById.mockReturnValue(test);
    const { result } = renderHook(() => useCorePlayTest('test-1', mockNavigate));
    await act(async () => {
      await new Promise(r => setTimeout(r, 700));
    });
    act(() => result.current.setHasStarted(true));
    act(() => result.current.handleSelect('أ'));
    act(() => result.current.handleNext());
    act(() => result.current.handleSelect('true'));
    act(() => result.current.handleNext());
    expect(result.current.score).toBe(2);
  });

  it('calls rateTestInSupabase when rating', async () => {
    const test = buildTest();
    mockLocalGetTestById.mockReturnValue(test);
    mockRateTestInSupabase.mockResolvedValue({ success: true, updatedRating: 4 });
    const { result } = renderHook(() => useCorePlayTest('test-1', mockNavigate));
    await act(async () => {
      await new Promise(r => setTimeout(r, 700));
    });
    act(() => result.current.setHasStarted(true));
    act(() => result.current.handleSelect('أ'));
    act(() => result.current.handleNext());
    act(() => result.current.handleNext());
    await act(async () => {
      await result.current.rateTest(5);
    });
    expect(mockRateTestInSupabase).toHaveBeenCalledWith('test-1', 5);
  });

  it('navigates away on Escape', async () => {
    const test = buildTest();
    mockLocalGetTestById.mockReturnValue(test);
    const { result } = renderHook(() => useCorePlayTest('test-1', mockNavigate, { backPath: '/exam/saved' }));
    await act(async () => {
      await new Promise(r => setTimeout(r, 700));
    });
    act(() => result.current.setHasStarted(true));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(mockNavigate).toHaveBeenCalledWith('/exam/saved');
  });

  it('shows results when time runs out', async () => {
    const test = buildTest({ settings: { showExplanations: true, globalTimeLimitMinutes: 1 } });
    mockLocalGetTestById.mockReturnValue(test);
    const { result } = renderHook(() => useCorePlayTest('test-1', mockNavigate));
    await act(async () => {
      await new Promise(r => setTimeout(r, 700));
    });
    act(() => result.current.setHasStarted(true));
    expect(result.current.timeLeft).toBe(60);
    await act(async () => {
      await new Promise(r => setTimeout(r, 1100));
    });
    expect(result.current.timeLeft).toBeLessThan(60);
  });
});
