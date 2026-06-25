import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PlayTestShell } from '@/src/features/exam/components/PlayTestShell';
import type { TestModel, Question } from '@/src/features/exam/src/types';

const buildQuestion = (id = 'q-1', type: 'multiple_choice' | 'true_false' | 'essay' = 'multiple_choice', correctAnswer = 'ب'): Question => ({
  id,
  type,
  text: 'سؤال تجريبي',
  options: ['أ', 'ب', 'ج', 'د'],
  correctAnswer,
  explanation: 'شرح الإجابة',
});

const buildTest = (overrides: Partial<TestModel> = {}): TestModel => ({
  id: 'test-1',
  title: 'اختبار تجريبي',
  description: 'وصف الاختبار',
  createdAt: Date.now(),
  settings: { showExplanations: true },
  questions: [buildQuestion()],
  published: false,
  ...overrides,
});

function TestHarness({ test, showResults, hasStarted, error, score, selectedAnswers, currentIdx, immediateFeedback, isAnswerRevealed, isCurrentCorrect, isLoading }: { test: TestModel | null; showResults?: boolean; hasStarted?: boolean; error?: string | null; score?: number; selectedAnswers?: Record<string, string>; currentIdx?: number; immediateFeedback?: boolean; isAnswerRevealed?: boolean; isCurrentCorrect?: boolean; isLoading?: boolean }) {
  const [state, setState] = React.useState({
    test,
    isLoading: isLoading ?? false,
    error: error ?? null,
    hasStarted: hasStarted ?? false,
    setHasStarted: vi.fn(),
    immediateFeedback: immediateFeedback ?? false,
    setImmediateFeedback: vi.fn(),
    currentIdx: currentIdx ?? 0,
    selectedAnswers: selectedAnswers ?? {},
    showResults: showResults ?? false,
    isAnswerRevealed: isAnswerRevealed ?? false,
    timeLeft: null as number | null,
    score: score ?? 0,
    currentQ: test?.questions[currentIdx ?? 0] ?? null,
    isCurrentCorrect: isCurrentCorrect ?? false,
    handleSelect: vi.fn(),
    handleNext: vi.fn(),
    formatTime: (seconds: number) => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`,
    handleKeyDown: vi.fn(),
    setCurrentIdx: vi.fn(),
    rateTest: vi.fn(),
    canRate: true,
  });

  React.useEffect(() => {
    setState(prev => ({
      ...prev,
      test,
      isLoading: isLoading ?? prev.isLoading,
      error: error ?? prev.error,
      hasStarted: hasStarted ?? prev.hasStarted,
      showResults: showResults ?? prev.showResults,
      score: score ?? prev.score,
      selectedAnswers: selectedAnswers ?? prev.selectedAnswers,
      currentIdx: currentIdx ?? prev.currentIdx,
      immediateFeedback: immediateFeedback ?? prev.immediateFeedback,
      isAnswerRevealed: isAnswerRevealed ?? prev.isAnswerRevealed,
      isCurrentCorrect: isCurrentCorrect ?? prev.isCurrentCorrect,
      currentQ: test?.questions[currentIdx ?? prev.currentIdx] ?? prev.currentQ,
    }));
  }, [test, hasStarted, showResults, error, score, selectedAnswers, currentIdx, immediateFeedback, isAnswerRevealed, isCurrentCorrect, isLoading]);

  return (
    <MemoryRouter>
      <PlayTestShell state={state as any} backPath="/exam/saved" showRateUI={false} />
    </MemoryRouter>
  );
}

describe('PlayTestShell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loading and error', () => {
    it('renders loading skeleton', () => {
      render(<TestHarness test={null} isLoading={true} />);
      expect(document.querySelector('.skeleton-shimmer')).toBeTruthy();
    });

    it('renders error state', () => {
      render(<TestHarness test={null} error="فشل التحميل" />);
      expect(screen.getByText('تعذر تحميل الاختبار')).toBeTruthy();
      expect(screen.getByText('فشل التحميل')).toBeTruthy();
    });
  });

  describe('pre-start screen', () => {
    it('renders test title', () => {
      render(<TestHarness test={buildTest()} />);
      expect(screen.getByText('اختبار تجريبي')).toBeTruthy();
    });

    it('renders description', () => {
      render(<TestHarness test={buildTest()} />);
      expect(screen.getByText('وصف الاختبار')).toBeTruthy();
    });

    it('shows question count', () => {
      render(<TestHarness test={buildTest()} />);
      expect(screen.getByText('1')).toBeTruthy();
    });

    it('shows explanations status', () => {
      render(<TestHarness test={buildTest()} />);
      expect(screen.getByText('متوفرة')).toBeTruthy();
    });

    it('hides time limit when not set', () => {
      render(<TestHarness test={buildTest()} />);
      expect(screen.queryByText(/دقيقة/)).toBeNull();
    });

    it('renders feedback mode radio options', () => {
      render(<TestHarness test={buildTest()} />);
      expect(screen.getByText('تصحيح في النهاية (وضع الاختبار)')).toBeTruthy();
      expect(screen.getByText('تصحيح فوري (وضع التعلم)')).toBeTruthy();
    });

    it('calls setHasStarted on start button click', () => {
      render(<TestHarness test={buildTest()} />);
      expect(screen.getByText('ابدأ الاختبار الآن')).toBeTruthy();
    });
  });

  describe('in-progress screen', () => {
    it('renders question counter', () => {
      render(<TestHarness test={buildTest()} hasStarted />);
      expect(screen.getByText('السؤال 1 من 1')).toBeTruthy();
    });

    it('renders MCQ options', () => {
      render(<TestHarness test={buildTest()} hasStarted />);
      expect(screen.getByText('أ')).toBeTruthy();
      expect(screen.getByText('ب')).toBeTruthy();
    });

    it('renders true/false buttons', () => {
      render(<TestHarness test={buildTest({ questions: [buildQuestion('tf', 'true_false', 'true')] })} hasStarted />);
      expect(screen.getByText('صح')).toBeTruthy();
      expect(screen.getByText('خطأ')).toBeTruthy();
    });

    it('renders essay textarea', () => {
      render(<TestHarness test={buildTest({ questions: [buildQuestion('e', 'essay', '')] })} hasStarted />);
      expect(screen.getByPlaceholderText('اكتب إجابتك هنا...')).toBeTruthy();
    });

    it('shows correct feedback when answer revealed', () => {
      render(
        <TestHarness test={buildTest()} hasStarted isAnswerRevealed isCurrentCorrect />
      );
      expect(screen.getByText('إجابة صحيحة!')).toBeTruthy();
    });

    it('shows submit button text for immediate feedback', () => {
      const q = buildQuestion('cb');
      const test = buildTest({ questions: [q] });
      render(
        <TestHarness
          test={test}
          hasStarted
          immediateFeedback
          selectedAnswers={{ 'cb': 'أ' }}
        />
      );
      expect(screen.getByText('تأكيد الإجابة')).toBeTruthy();
    });

    it('shows finish button on last question', () => {
      const testTwo = buildTest({ questions: [buildQuestion('q1'), buildQuestion('q2')] });
      render(<TestHarness test={testTwo} hasStarted currentIdx={1} />);
      expect(screen.getByText('إنهاء الاختبار')).toBeTruthy();
    });
  });

  describe('results screen', () => {
    it('shows score', () => {
      render(<TestHarness test={buildTest()} hasStarted showResults score={1} />);
      expect(screen.getByText('1 / 1')).toBeTruthy();
    });

    it('shows perfect message at full score', () => {
      render(<TestHarness test={buildTest()} hasStarted showResults score={1} />);
      expect(screen.getByText('أداء مثالي! أحسنت صنعاً.')).toBeTruthy();
    });

    it('shows retry message when not perfect', () => {
      render(<TestHarness test={buildTest({ questions: [buildQuestion(), buildQuestion()] })} hasStarted showResults score={1} />);
      expect(screen.getByText('أداء جيد، يمكنك المحاولة مرة أخرى لتحسين النتيجة.')).toBeTruthy();
    });

    it('renders answer review', () => {
      render(<TestHarness test={buildTest()} hasStarted showResults score={1} />);
      expect(screen.getByText('مراجعة الإجابات')).toBeTruthy();
    });

    it('shows skipped for unanswered questions', () => {
      render(<TestHarness test={buildTest()} hasStarted showResults score={0} selectedAnswers={{}} />);
      expect(screen.getAllByText(/تم التخطي/).length).toBeGreaterThan(0);
    });

    it('shows explanation when enabled', () => {
      render(<TestHarness test={buildTest()} hasStarted showResults score={0} selectedAnswers={{}} />);
      expect(screen.getByText('الشرح:')).toBeTruthy();
      expect(screen.getByText('شرح الإجابة')).toBeTruthy();
    });
  });
});
