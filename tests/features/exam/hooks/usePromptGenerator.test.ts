import { describe, it, expect } from 'vitest';
import { usePromptGenerator } from '@/src/features/exam/src/hooks/usePromptGenerator';
import { renderHook } from '@testing-library/react';

const defaults = {
  topic: 'البنى الجبرية',
  difficulty: 'متوسط',
  mcqCount: 10,
  tfCount: 5,
  essayCount: 0,
  includeExplanations: true,
};

describe('usePromptGenerator', () => {
  it('includes topic and difficulty', () => {
    const { result } = renderHook(() => usePromptGenerator(defaults));
    expect(result.current).toContain('البنى الجبرية');
    expect(result.current).toContain('متوسط');
  });

  it('includes MCQ count when positive', () => {
    const { result } = renderHook(() => usePromptGenerator(defaults));
    expect(result.current).toContain('10 أسئلة اختيار من متعدد');
  });

  it('omits MCQ section when count is zero', () => {
    const { result } = renderHook(() => usePromptGenerator({ ...defaults, mcqCount: 0 }));
    expect(result.current).not.toContain('اختيار من متعدد');
  });

  it('includes true/false count when positive', () => {
    const { result } = renderHook(() => usePromptGenerator(defaults));
    expect(result.current).toContain('5 أسئلة صح/خطأ');
  });

  it('includes essay count when positive', () => {
    const { result } = renderHook(() => usePromptGenerator({ ...defaults, essayCount: 3 }));
    expect(result.current).toContain('3 أسئلة مقالية');
  });

  it('includes JSON schema when explanations are enabled', () => {
    const { result } = renderHook(() => usePromptGenerator(defaults));
    expect(result.current).toContain('explanation');
    expect(result.current).toContain('الـ JSON الخام الصالح');
  });

  it('omits explanation field when explanations disabled', () => {
    const { result } = renderHook(() => usePromptGenerator({ ...defaults, includeExplanations: false }));
    expect(result.current).not.toContain('"explanation"');
  });

  it('falls back topic to general when empty', () => {
    const { result } = renderHook(() => usePromptGenerator({ ...defaults, topic: '' }));
    expect(result.current).toContain('موضوع "عام"');
  });

  it('returns identical output for same prefs (memoized)', () => {
    const { result, rerender } = renderHook(() => usePromptGenerator(defaults));
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });
});
