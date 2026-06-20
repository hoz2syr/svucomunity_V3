import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePromptPreferences } from '@/src/features/exam/src/hooks/usePromptPreferences';

describe('usePromptPreferences', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('initializes with defaults when no saved data exists', () => {
    const { result } = renderHook(() => usePromptPreferences());
    expect(result.current.prefs.topic).toBe('البنى الجبرية');
    expect(result.current.prefs.difficulty).toBe('متوسط');
    expect(result.current.prefs.mcqCount).toBe(10);
    expect(result.current.prefs.tfCount).toBe(5);
    expect(result.current.prefs.essayCount).toBe(0);
    expect(result.current.prefs.includeExplanations).toBe(true);
  });

  it('loads saved preferences from localStorage', () => {
    localStorage.setItem('svu_prompt_settings', JSON.stringify({
      topic: 'الفيزياء',
      difficulty: 'صعب',
      mcqCount: 20,
      tfCount: 10,
      essayCount: 5,
      includeExplanations: false,
    }));
    const { result } = renderHook(() => usePromptPreferences());
    expect(result.current.prefs.topic).toBe('الفيزياء');
    expect(result.current.prefs.mcqCount).toBe(20);
    expect(result.current.prefs.includeExplanations).toBe(false);
  });

  it('update changes a single field', () => {
    const { result } = renderHook(() => usePromptPreferences());
    act(() => result.current.update('topic', 'الكيمياء'));
    expect(result.current.prefs.topic).toBe('الكيمياء');
    expect(result.current.prefs.mcqCount).toBe(10);
  });

  it('save persists to localStorage', () => {
    const { result } = renderHook(() => usePromptPreferences());
    act(() => result.current.update('difficulty', 'سهل'));
    act(() => result.current.save());
    const saved = JSON.parse(localStorage.getItem('svu_prompt_settings')!);
    expect(saved.difficulty).toBe('سهل');
  });

  it('isSaved flag is true after save', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => usePromptPreferences());
    act(() => result.current.save());
    expect(result.current.isSaved).toBe(true);
    vi.useRealTimers();
  });

  it('falls back to defaults on corrupt localStorage', () => {
    localStorage.setItem('svu_prompt_settings', 'not-json');
    const { result } = renderHook(() => usePromptPreferences());
    expect(result.current.prefs.topic).toBe('البنى الجبرية');
  });
});
