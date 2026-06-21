import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTestCreator } from '@/src/features/exam/src/hooks/useTestCreator';

const mockNavigate = vi.fn();

let mockSession: { user: { id: string } } | null = null;
const mockHasSupabaseEnvFn = vi.fn(() => true);

vi.mock('@/src/contexts/AuthContext', () => ({
  useAuth: () => ({ session: mockSession ? { user: mockSession.user } : null, loading: false, envMissing: false, signIn: vi.fn(), signOut: vi.fn() }),
}));

const upsertImpl = vi.fn(async () => ({ error: null }));
vi.mock('@/src/features/exam/src/services/exam.supabase', () => ({
  upsertTestToSupabase: (...args: unknown[]) => upsertImpl(...args),
}));

vi.mock('@/src/lib/supabase', () => ({
  hasSupabaseEnv: (...args: unknown[]) => mockHasSupabaseEnvFn(...args),
  missingSupabaseEnvMessage: 'Missing Supabase environment variables',
  saveTest: vi.fn(),
}));

const resetSupabaseMock = () => {
  upsertImpl.mockClear();
  upsertImpl.mockImplementation(async () => ({ error: null }));
};

describe('useTestCreator: existing behaviour', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mockSession = null;
    mockHasSupabaseEnvFn.mockReturnValue(true);
    resetSupabaseMock();
    localStorage.clear();
  });

  it('initializes with empty state', () => {
    const { result } = renderHook(() => useTestCreator());
    expect(result.current.testTitle).toBe('');
    expect(result.current.jsonText).toBe('');
    expect(result.current.error).toBe('');
    expect(result.current.showExplanations).toBe(true);
    expect(result.current.globalTimeLimit).toBe(0);
    expect(result.current.publishingId).toBeNull();
    expect(result.current.publishError).toBeNull();
  });

  it('reports error and does not navigate when title is empty', () => {
    const { result } = renderHook(() => useTestCreator());
    act(() => result.current.handleCreate(mockNavigate));
    expect(result.current.error).toBe('يرجى إدخال عنوان الاختبار');
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('reports error for malformed JSON', () => {
    const { result } = renderHook(() => useTestCreator());
    act(() => result.current.setTestTitle('اختبار'));
    act(() => result.current.setJsonText('not-valid-json'));
    act(() => result.current.handleCreate(mockNavigate));
    expect(result.current.error).toBe('صيغة JSON غير صالحة. تأكد من صحة الملف.');
  });

  it('reports error when no questions array is found', () => {
    const { result } = renderHook(() => useTestCreator());
    act(() => result.current.setTestTitle('اختبار'));
    act(() => result.current.setJsonText(JSON.stringify({ unrelated: true })));
    act(() => result.current.handleCreate(mockNavigate));
    expect(result.current.error).toContain('لم يتم العثور على مصفوفة أسئلة');
  });

  it('accepts questions wrapped in a questions property', () => {
    const { result } = renderHook(() => useTestCreator());
    const payload = JSON.stringify({ questions: [{ id: 'q1', type: 'multiple_choice', text: 'س', options: ['أ'], correctAnswer: 'أ' }] });
    act(() => result.current.setTestTitle('اختبار'));
    act(() => result.current.setJsonText(payload));
    act(() => result.current.handleCreate(mockNavigate));
    expect(mockNavigate).toHaveBeenCalledWith('/exam/saved');
    expect(result.current.error).toBe('');
  });

  it('strips ```json fenced markdown before parsing', () => {
    const { result } = renderHook(() => useTestCreator());
    const wrapped = '```json\n[{"id":"q1","type":"multiple_choice","text":"س","options":["أ"],"correctAnswer":"أ"}]\n```';
    act(() => result.current.setTestTitle('اختبار'));
    act(() => result.current.setJsonText(wrapped));
    act(() => result.current.handleCreate(mockNavigate));
    expect(mockNavigate).toHaveBeenCalledWith('/exam/saved');
  });

  it('persists the new test to localStorage with published=false', () => {
    const { result } = renderHook(() => useTestCreator());
    const valid = JSON.stringify([{ id: 'q1', type: 'multiple_choice', text: 'س', options: ['أ'], correctAnswer: 'أ' }]);
    act(() => result.current.setTestTitle('اختبار'));
    act(() => result.current.setJsonText(valid));
    act(() => result.current.handleCreate(mockNavigate));
    const stored = JSON.parse(localStorage.getItem('svu_tests_db') ?? '[]');
    const saved = stored.find((t: { id: string; title: string }) => t.title === 'اختبار');
    expect(saved).toBeDefined();
    expect(saved.published).toBe(false);
  });

  it('does not call upsertTestToSupabase during handleCreate (privacy-first)', () => {
    mockSession = { user: { id: 'user-1' } };
    const { result } = renderHook(() => useTestCreator());
    act(() => result.current.setTestTitle('اختبار'));
    act(() => result.current.setJsonText(JSON.stringify([{ id: 'q1', type: 'multiple_choice', text: 'س', options: ['أ'], correctAnswer: 'أ' }])));
    act(() => result.current.handleCreate(mockNavigate));
    expect(upsertImpl).not.toHaveBeenCalled();
  });
});

describe('useTestCreator: handlePublish', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mockHasSupabaseEnvFn.mockReturnValue(true);
    resetSupabaseMock();
    localStorage.clear();
  });

  const withLoggedInUser = () => {
    mockSession = { user: { id: 'user-1' } };
  };

  const seedTest = (overrides = {}) => {
    const test = {
      id: 'test-1',
      title: 'اختبار للنشر',
      description: '',
      createdAt: Date.now(),
      settings: { showExplanations: true },
      questions: [],
      published: false,
      ...overrides,
    };
    const existing = (() => {
      try { return JSON.parse(localStorage.getItem('svu_tests_db') ?? '[]'); } catch { return []; }
    })();
    existing.push(test);
    localStorage.setItem('svu_tests_db', JSON.stringify(existing));
    return test;
  };

  it('redirects to login when user is not authenticated', async () => {
    mockSession = null;
    seedTest();
    const { result } = renderHook(() => useTestCreator());
    await act(async () => {
      await result.current.handlePublish('test-1', mockNavigate);
    });
    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
    expect(upsertImpl).not.toHaveBeenCalled();
  });

  it('shows env error when Supabase env is missing', async () => {
    withLoggedInUser();
    mockHasSupabaseEnvFn.mockReturnValue(false);
    seedTest();
    const { result } = renderHook(() => useTestCreator());
    await act(async () => {
      await result.current.handlePublish('test-1', mockNavigate);
    });
    expect(result.current.publishError).toBe('Missing Supabase environment variables');
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('publishes the test via Supabase when logged in and env is available', async () => {
    withLoggedInUser();
    seedTest();
    const { result } = renderHook(() => useTestCreator());
    await act(async () => {
      await result.current.handlePublish('test-1', mockNavigate);
    });
    expect(upsertImpl).toHaveBeenCalledTimes(1);
    const arg = upsertImpl.mock.calls[0][0] as { userId: string; published: boolean };
    expect(arg.userId).toBe('user-1');
    expect(arg.published).toBe(true);
    expect(mockNavigate).toHaveBeenCalledWith('/exam/saved');
  });

  it('surfaces a Supabase publish error without navigating', async () => {
    withLoggedInUser();
    seedTest();
    upsertImpl.mockImplementationOnce(async () => ({ error: { message: 'Publish failed' } }));
    const { result } = renderHook(() => useTestCreator());
    await act(async () => {
      await result.current.handlePublish('test-1', mockNavigate);
    });
    expect(result.current.publishError).toBe('Publish failed');
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('reports error when test does not exist in localStorage', async () => {
    withLoggedInUser();
    localStorage.setItem('svu_tests_db', JSON.stringify([]));
    const { result } = renderHook(() => useTestCreator());
    await act(async () => {
      await result.current.handlePublish('non-existent', mockNavigate);
    });
    expect(result.current.publishError).toBe('الاختبار غير موجود');
    expect(upsertImpl).not.toHaveBeenCalled();
  });

  it('handles Supabase exception gracefully', async () => {
    withLoggedInUser();
    seedTest();
    upsertImpl.mockImplementationOnce(async () => { throw new Error('network down'); });
    const { result } = renderHook(() => useTestCreator());
    await act(async () => {
      await result.current.handlePublish('test-1', mockNavigate);
    });
    expect(result.current.publishError).toBe('network down');
    expect(upsertImpl).toHaveBeenCalledTimes(1);
  });
});
