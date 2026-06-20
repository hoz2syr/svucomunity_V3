import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTestCreator } from '@/src/features/exam/src/hooks/useTestCreator';

const mockNavigate = vi.fn();

const mockAuthState = { session: null, loading: false, envMissing: false, signIn: vi.fn(), signOut: vi.fn() };
const mockGetState = vi.fn(() => mockAuthState);
const mockSubscribe = vi.fn(() => () => {});

vi.mock('@/src/contexts/AuthContext', () => ({
  useAuth: () => mockAuthState,
}));

vi.mock('@/src/features/exam/src/services/exam.supabase', () => ({
  upsertTestToSupabase: vi.fn().mockResolvedValue({ error: null }),
}));

describe('useTestCreator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthState.session = null;
    localStorage.clear();
  });

  it('initializes with empty state', () => {
    const { result } = renderHook(() => useTestCreator());
    expect(result.current.testTitle).toBe('');
    expect(result.current.jsonText).toBe('');
    expect(result.current.error).toBe('');
    expect(result.current.showExplanations).toBe(true);
    expect(result.current.globalTimeLimit).toBe(0);
  });

  it('reports error when title is empty on create', () => {
    const { result } = renderHook(() => useTestCreator());
    act(() => result.current.handleCreate(mockNavigate));
    expect(result.current.error).toBe('يرجى إدخال عنوان الاختبار');
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('reports error for invalid JSON', () => {
    const { result } = renderHook(() => useTestCreator());
    act(() => result.current.setTestTitle('اختبار'));
    act(() => result.current.setJsonText('not-valid-json'));
    act(() => result.current.handleCreate(mockNavigate));
    expect(result.current.error).toBe('صيغة JSON غير صالحة. تأكد من صحة الملف.');
  });

  it('saves valid JSON array and navigates', () => {
    const { result } = renderHook(() => useTestCreator());
    const validJson = JSON.stringify([
      { id: 'q1', type: 'multiple_choice', text: 'سؤال 1', options: ['أ', 'ب'], correctAnswer: 'أ' },
    ]);
    act(() => result.current.setTestTitle('اختبار صالح'));
    act(() => result.current.setJsonText(validJson));
    act(() => result.current.handleCreate(mockNavigate));
    expect(mockNavigate).toHaveBeenCalledWith('/exam/saved');
    expect(result.current.error).toBe('');
    expect(localStorage.getItem('svu_tests_db')).not.toBeNull();
  });

  it('strips markdown code fences before parsing', () => {
    const { result } = renderHook(() => useTestCreator());
    const wrapped = '```json\n[{"id":"q1","type":"multiple_choice","text":"س","options":["أ"],"correctAnswer":"أ"}]\n```';
    act(() => result.current.setTestTitle('اختبار'));
    act(() => result.current.setJsonText(wrapped));
    act(() => result.current.handleCreate(mockNavigate));
    expect(mockNavigate).toHaveBeenCalledWith('/exam/saved');
  });

  it('reports error when no questions array is found', () => {
    const { result } = renderHook(() => useTestCreator());
    act(() => result.current.setTestTitle('اختبار'));
    act(() => result.current.setJsonText(JSON.stringify({ unrelated: true })));
    act(() => result.current.handleCreate(mockNavigate));
    expect(result.current.error).toContain('لم يتم العثور على مصفوفة أسئلة');
  });
});
