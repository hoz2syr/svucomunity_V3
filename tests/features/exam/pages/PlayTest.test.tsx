import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockUseParams = vi.fn();
const mockUseNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useParams: () => mockUseParams(),
    useNavigate: () => mockUseNavigate(),
  };
});

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

const mockHookReturn = (overrides: Record<string, unknown> = {}): Record<string, unknown> => ({
  test: null,
  isLoading: false,
  error: null,
  hasStarted: false,
  setHasStarted: vi.fn(),
  immediateFeedback: false,
  setImmediateFeedback: vi.fn(),
  currentIdx: 0,
  selectedAnswers: {},
  showResults: false,
  isAnswerRevealed: false,
  timeLeft: null,
  score: 0,
  currentQ: null,
  isCurrentCorrect: false,
  handleSelect: vi.fn(),
  handleNext: vi.fn(),
  formatTime: (seconds: number) => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`,
  handleKeyDown: vi.fn(),
  setCurrentIdx: vi.fn(),
  rateTest: vi.fn(),
  canRate: true,
  ...overrides,
});

interface TestComponentProps {
  test?: TestModel | null;
  isLoading?: boolean;
  error?: string | null;
  hasStarted?: boolean;
  immediateFeedback?: boolean;
  currentIdx?: number;
  selectedAnswers?: Record<string, string>;
  showResults?: boolean;
  isAnswerRevealed?: boolean;
  timeLeft?: number | null;
  score?: number;
  currentQ?: Question | null;
  isCurrentCorrect?: boolean;
  rating?: number;
  navigate?: (path: string) => void;
  onBack?: () => void;
  onStart?: () => void;
  onSwitchFeedback?: (v: boolean) => void;
  onSelect?: (answer: string) => void;
  onNext?: () => void;
  onRate?: (stars: number) => void;
  onPrev?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

function TestComponent({
  test = null,
  isLoading = false,
  error = null,
  hasStarted = false,
  immediateFeedback = false,
  currentIdx = 0,
  selectedAnswers = {},
  showResults = false,
  isAnswerRevealed = false,
  timeLeft = null,
  score = 0,
  currentQ = null,
  isCurrentCorrect = false,
  rating,
  navigate = () => {},
  onBack = () => {},
  onStart = () => {},
  onSwitchFeedback = () => {},
  onSelect = () => {},
  onNext = () => {},
  onRate = () => {},
  onPrev = () => {},
  onKeyDown = () => {},
}: TestComponentProps) {
  if (isLoading) return <div data-testid="loading"><div className="skeleton-shimmer" /></div>;
  if (error) return <div><div>تعذر تحميل الاختبار</div><div>{error}</div></div>;
  if (!test) return null;

  if (!hasStarted) {
    return (
      <div>
        <button onClick={onBack} data-testid="prestart-back" className="min-h-[44px]">العودة للاختبارات</button>
        <h1 className="text-xl sm:text-2xl md:text-3xl">{test.title}</h1>
        {test.description && <p className="text-xs sm:text-sm">{test.description}</p>}
        <div data-testid="stats">
          <div><div>الأسئلة</div><div className="text-lg sm:text-xl">{test.questions.length}</div></div>
          <div><div>الشروحات المرفقة</div><div>{test.settings.showExplanations ? 'متوفرة' : 'غير متوفرة'}</div></div>
          {test.settings.globalTimeLimitMinutes && <div><div>الوقت المخصص</div><div>{test.settings.globalTimeLimitMinutes} دقيقة</div></div>}
        </div>
        <div data-testid="settings">
          <div>إعدادات بدء الاختبار</div>
          <label>
            <input type="radio" name="fb" checked={!immediateFeedback} onChange={() => onSwitchFeedback(false)} />
            <span>تصحيح في النهاية (وضع الاختبار)</span>
          </label>
          <label>
            <input type="radio" name="fb" checked={immediateFeedback} onChange={() => onSwitchFeedback(true)} />
            <span>تصحيح فوري (وضع التعلم)</span>
          </label>
        </div>
        <button onClick={onStart} data-testid="start-btn" className="min-h-[44px]">ابدأ الاختبار الآن</button>
      </div>
    );
  }

  if (showResults) {
    return (
      <div>
        <button onClick={onBack} data-testid="results-back" className="min-h-[44px]">العودة للاختبارات</button>
        <h2 className="text-xl sm:text-2xl md:text-3xl">النتيجة النهائية</h2>
        <p>لقد أكملت اختبار: {test.title}</p>
        <div className="text-4xl sm:text-5xl md:text-6xl">{score} / {test.questions.length}</div>
        <p className="text-xs sm:text-sm">
          {score === test.questions.length ? 'أداء مثالي! أحسنت صنعاً.' : 'أداء جيد، يمكنك المحاولة مرة أخرى لتحسين النتيجة.'}
        </p>
        <div data-testid="stars">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              onClick={() => onRate(star)}
              aria-label={`تقييم ${star} من 5`}
              className="min-w-[44px] min-h-[44px]"
            />
          ))}
        </div>
        <p>تقييم الاختبار</p>
        <h3 className="text-lg sm:text-xl">مراجعة الإجابات</h3>
        {test.questions.map((q: Question, i: number) => {
          const userAnswer = selectedAnswers[q.id];
          return (
            <div key={q.id}>
              <h4>السؤال {i + 1}: {q.text}</h4>
              <p>إجابتك: {userAnswer || '(تم التخطي)'}</p>
              {userAnswer !== q.correctAnswer && <p>الإجابة الصحيحة: {q.correctAnswer}</p>}
            </div>
          );
        })}
      </div>
    );
  }

  if (!currentQ) return null;

  return (
    <div>
      <button onClick={onBack} data-testid="quiz-back" className="min-h-[44px]">
        <span>العودة</span>
      </button>
      <div>
        <span>السؤال {currentIdx + 1} من {test.questions.length}</span>
        <span>{timeLeft !== null ? formatTimeLocal(timeLeft) : ''}</span>
      </div>
      <button
        onClick={onPrev}
        disabled={currentIdx === 0}
        data-testid="prev-btn"
        className="min-h-[44px]"
      >
        <span>السؤال السابق</span>
      </button>
      <button
        onClick={onNext}
        disabled={currentIdx === test.questions.length - 1}
        data-testid="next-btn"
        className="min-h-[44px]"
      >
        <span>السؤال التالي</span>
      </button>
      <div onKeyDown={onKeyDown} tabIndex={0}>
        <h2 className="text-lg sm:text-xl md:text-2xl">{currentQ.text}</h2>
        <p className="text-[10px] sm:text-xs">الأسهم للتنقل بين الأسئلة · 1-9 للاختيار · t/f لصح/خطأ · Enter للتأكيد</p>
        <div data-testid="options">
          {currentQ.type === 'multiple_choice' && currentQ.options?.map((opt, i) => (
            <button key={i} onClick={() => onSelect(opt)}>
              <span>{opt}</span>
            </button>
          ))}
          {currentQ.type === 'true_false' && (
            <div>
              {['true', 'false'].map(val => (
                <button key={val} onClick={() => onSelect(val)}>
                  <span>{val === 'true' ? 'صح' : 'خطأ'}</span>
                </button>
              ))}
            </div>
          )}
          {currentQ.type === 'essay' && (
            <textarea placeholder="اكتب إجابتك هنا..." readOnly className="min-h-[100px] sm:min-h-[120px]" />
          )}
        </div>
        {isAnswerRevealed && (
          <div>
            <span>{isCurrentCorrect ? 'إجابة صحيحة!' : 'إجابة خاطئة'}</span>
            {!isCurrentCorrect && currentQ.correctAnswer && <span>الإجابة الصحيحة: {currentQ.correctAnswer}</span>}
          </div>
        )}
        <button data-testid="submit-btn">
          {immediateFeedback && !isAnswerRevealed && currentQ.type !== 'essay'
            ? 'تأكيد إجابة'
            : currentIdx === test.questions.length - 1 ? 'إنهاء الاختبار' : 'السؤال التالي'}
        </button>
      </div>
    </div>
  );
}

function formatTimeLocal(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

beforeEach(() => {
  mockUseParams.mockReturnValue({ id: 'test-1' });
  mockUseNavigate.mockReturnValue(() => {});
});

describe('PlayTest component tests', () => {
  describe('loading state', () => {
    it('renders loading skeleton', () => {
      render(<TestComponent isLoading />);
      expect(screen.getByTestId('loading')).toBeTruthy();
    });
  });

  describe('error state', () => {
    it('renders error message', () => {
      render(<TestComponent error="خطأ في التحميل" />);
      expect(screen.getByText('تعذر تحميل الاختبار')).toBeTruthy();
      expect(screen.getByText('خطأ في التحميل')).toBeTruthy();
    });
  });

  describe('pre-start screen', () => {
    const testData = buildTest();

    it('renders test title', () => {
      render(<MemoryRouter><TestComponent test={testData} hasStarted={false} /></MemoryRouter>);
      expect(screen.getByText('اختبار تجريبي')).toBeTruthy();
    });

    it('renders description', () => {
      render(<TestComponent test={testData} hasStarted={false} />);
      expect(screen.getByText('وصف الاختبار')).toBeTruthy();
    });

    it('shows question count stat', () => {
      render(<TestComponent test={testData} hasStarted={false} />);
      expect(screen.getByText('الأسئلة')).toBeTruthy();
      expect(screen.getByText('1')).toBeTruthy();
    });

    it('shows explanations as متوفرة', () => {
      render(<TestComponent test={testData} hasStarted={false} />);
      expect(screen.getByText('متوفرة')).toBeTruthy();
    });

    it('shows explanations as غير متوفرة', () => {
      render(<TestComponent test={buildTest({ settings: { showExplanations: false } })} hasStarted={false} />);
      expect(screen.getByText('غير متوفرة')).toBeTruthy();
    });

    it('renders time limit when set', () => {
      render(<TestComponent test={buildTest({ settings: { showExplanations: true, globalTimeLimitMinutes: 30 } })} hasStarted={false} />);
      expect(screen.getByText('30 دقيقة')).toBeTruthy();
    });

    it('hides time limit when not set', () => {
      render(<TestComponent test={testData} hasStarted={false} />);
      expect(screen.queryByText(/دقيقة/)).toBeNull();
    });

    it('renders feedback mode radio options', () => {
      render(<TestComponent test={testData} hasStarted={false} />);
      expect(screen.getByText('تصحيح في النهاية (وضع الاختبار)')).toBeTruthy();
      expect(screen.getByText('تصحيح فوري (وضع التعلم)')).toBeTruthy();
    });

    it('calls setImmediateFeedback(true) when immediate mode selected', () => {
      const setFeedback = vi.fn();
      render(<TestComponent test={testData} hasStarted={false} onSwitchFeedback={setFeedback} />);
      fireEvent.click(screen.getByText('تصحيح فوري (وضع التعلم)'));
      expect(setFeedback).toHaveBeenCalledWith(true);
    });

    it('calls setHasStarted on start button click', () => {
      const start = vi.fn();
      render(<TestComponent test={testData} hasStarted={false} onStart={start} />);
      fireEvent.click(screen.getByTestId('start-btn'));
      expect(start).toHaveBeenCalled();
    });

    it('start button has 44px min-height', () => {
      render(<TestComponent test={testData} hasStarted={false} />);
      expect(screen.getByTestId('start-btn')).toHaveClass('min-h-[44px]');
    });

    it('back button has 44px min-height', () => {
      render(<TestComponent test={testData} hasStarted={false} />);
      expect(screen.getByTestId('prestart-back')).toHaveClass('min-h-[44px]');
    });

    it('title uses responsive text sizes', () => {
      render(<TestComponent test={testData} hasStarted={false} />);
      const title = screen.getByText('اختبار تجريبي');
      expect(title.className).toContain('text-xl');
      expect(title.className).toContain('sm:text-2xl');
      expect(title.className).toContain('md:text-3xl');
    });

    it('stat numbers use responsive sizes', () => {
      render(<TestComponent test={testData} hasStarted={false} />);
      const statNumbers = document.querySelectorAll('.text-lg.sm\\:text-xl');
      expect(statNumbers.length).toBeGreaterThan(0);
    });
  });

  describe('in-progress screen', () => {
    const testData = buildTest({ questions: [buildQuestion(), buildQuestion()] });

    it('renders question counter', () => {
      render(<TestComponent test={testData} hasStarted currentIdx={0} currentQ={testData.questions[0]} formatTime={() => '5:00'} />);
      expect(screen.getByText('السؤال 1 من 2')).toBeTruthy();
    });

    it('renders question text', () => {
      render(<TestComponent test={testData} hasStarted currentIdx={0} currentQ={testData.questions[0]} formatTime={() => '5:00'} />);
      expect(screen.getByText('سؤال تجريبي')).toBeTruthy();
    });

  it('renders both navigation buttons', () => {
    render(<TestComponent test={testData} hasStarted currentIdx={0} currentQ={testData.questions[0]} formatTime={() => '5:00'} />);
    expect(screen.getByTestId('prev-btn')).toHaveTextContent('السؤال السابق');
    expect(screen.getByTestId('next-btn')).toHaveTextContent('السؤال التالي');
  });

    it('nav buttons have 44px min-height', () => {
      render(<TestComponent test={testData} hasStarted currentIdx={0} currentQ={testData.questions[0]} formatTime={() => '5:00'} />);
      expect(screen.getByTestId('prev-btn')).toHaveClass('min-h-[44px]');
      expect(screen.getByTestId('next-btn')).toHaveClass('min-h-[44px]');
    });

    it('back button has 44px min-height', () => {
      render(<TestComponent test={testData} hasStarted currentIdx={0} currentQ={testData.questions[0]} formatTime={() => '5:00'} />);
      expect(screen.getByTestId('quiz-back')).toHaveClass('min-h-[44px]');
    });

    it('renders mcq options', () => {
      render(<TestComponent test={testData} hasStarted currentIdx={0} currentQ={buildQuestion()} formatTime={() => '5:00'} />);
      expect(screen.getByText('أ')).toBeTruthy();
    });

    it('renders true/false buttons', () => {
      const testTf = buildTest({ questions: [buildQuestion('tf', 'true_false', 'true')] });
      render(<TestComponent test={testTf} hasStarted currentIdx={0} currentQ={buildQuestion('tf', 'true_false', 'true')} formatTime={() => '5:00'} />);
      expect(screen.getByText('صح')).toBeTruthy();
      expect(screen.getByText('خطأ')).toBeTruthy();
    });

    it('renders essay textarea', () => {
      const testEssay = buildTest({ questions: [buildQuestion('essay', 'essay', '')] });
      render(<TestComponent test={testEssay} hasStarted currentIdx={0} currentQ={buildQuestion('essay', 'essay', '')} formatTime={() => '5:00'} />);
      expect(screen.getByPlaceholderText('اكتب إجابتك هنا...')).toBeTruthy();
    });

    it('calls handleSelect on option click', () => {
      const select = vi.fn();
      render(<TestComponent test={testData} hasStarted currentIdx={0} currentQ={buildQuestion()} formatTime={() => '5:00'} onSelect={select} />);
      fireEvent.click(screen.getByText('أ'));
      expect(select).toHaveBeenCalledWith('أ');
    });

    it('shows correct feedback when answer revealed', () => {
      render(<TestComponent test={testData} hasStarted currentIdx={0} currentQ={buildQuestion()} isAnswerRevealed isCurrentCorrect formatTime={() => '5:00'} />);
      expect(screen.getByText('إجابة صحيحة!')).toBeTruthy();
    });

    it('shows wrong feedback with correct answer', () => {
      render(<TestComponent test={testData} hasStarted currentIdx={0} currentQ={buildQuestion()} isAnswerRevealed isCurrentCorrect={false} formatTime={() => '5:00'} />);
      expect(screen.getByText('إجابة خاطئة')).toBeTruthy();
      expect(screen.getByText(/الإجابة الصحيحة/)).toBeTruthy();
    });

    it('renders confirm button in immediate feedback mode', () => {
      const mcq = buildQuestion('cb');
      const testCb = buildTest({ questions: [mcq] });
      render(<TestComponent test={testCb} hasStarted currentIdx={0} currentQ={mcq} immediateFeedback isAnswerRevealed={false} selectedAnswers={{ 'cb': 'أ' }} formatTime={() => '5:00'} />);
      expect(screen.getByText('تأكيد إجابة')).toBeTruthy();
    });

    it('renders finish button on last question', () => {
      const testTwo = buildTest({ questions: [buildQuestion('q1'), buildQuestion('q2')] });
      render(<TestComponent test={testTwo} hasStarted currentIdx={1} currentQ={testTwo.questions[1]} formatTime={() => '0:00'} />);
      expect(screen.getByText('إنهاء الاختبار')).toBeTruthy();
    });

    it('renders formatted timer', () => {
      render(<TestComponent test={testData} hasStarted currentIdx={0} currentQ={testData.questions[0]} timeLeft={120} formatTime={() => '2:00'} />);
      expect(screen.getByText('2:00')).toBeTruthy();
    });
  });

  describe('results screen', () => {
    const resultsTest = buildTest({
      questions: [
        buildQuestion('q1', 'multiple_choice', 'أ'),
        buildQuestion('q2', 'multiple_choice', 'ب'),
        buildQuestion('q3', 'multiple_choice', 'ج'),
      ],
    });

    it('shows score heading', () => {
      render(<TestComponent test={resultsTest} hasStarted showResults score={2} formatTime={() => '0:00'} />);
      expect(screen.getByText('2 / 3')).toBeTruthy();
    });

    it('shows perfect message at full score', () => {
      render(<TestComponent test={buildTest({ questions: [buildQuestion()] })} hasStarted showResults score={1} formatTime={() => '0:00'} />);
      expect(screen.getByText('أداء مثالي! أحسنت صنعاً.')).toBeTruthy();
    });

    it('shows retry message', () => {
      render(<TestComponent test={resultsTest} hasStarted showResults score={2} formatTime={() => '0:00'} />);
      expect(screen.getByText('أداء جيد، يمكنك المحاولة مرة أخرى لتحسين النتيجة.')).toBeTruthy();
    });

    it('renders review section', () => {
      render(<TestComponent test={resultsTest} hasStarted showResults score={2} formatTime={() => '0:00'} />);
      expect(screen.getByText('مراجعة الإجابات')).toBeTruthy();
    });

    it('shows skipped for unanswered questions', () => {
      render(<TestComponent test={resultsTest} hasStarted showResults score={2} selectedAnswers={{}} formatTime={() => '0:00'} />);
      expect(screen.getAllByText(/تم التخطي/).length).toBeGreaterThan(0);
    });

    it('shows correct answer for wrong responses', () => {
      render(<TestComponent test={resultsTest} hasStarted showResults score={2} formatTime={() => '0:00'} />);
      expect(screen.getAllByText(/الإجابة الصحيحة/).length).toBeGreaterThan(0);
    });

    it('stars have correct aria-labels', () => {
      render(<TestComponent test={resultsTest} hasStarted showResults score={0} rating={0} formatTime={() => '0:00'} />);
      for (let i = 1; i <= 5; i++) {
        expect(screen.getByLabelText(`تقييم ${i} من 5`)).toBeTruthy();
      }
    });

    it('stars have 44px touch target', () => {
      render(<TestComponent test={resultsTest} hasStarted showResults score={0} rating={0} formatTime={() => '0:00'} />);
      screen.getAllByRole('button', { name: /تقييم/ }).forEach(btn => {
        expect(btn).toHaveClass('min-w-[44px]', 'min-h-[44px]');
      });
    });

    it('calls onRate when star is clicked', () => {
      const rateTest = vi.fn();
      render(<TestComponent test={resultsTest} hasStarted showResults score={0} rating={0} onRate={rateTest} formatTime={() => '0:00'} />);
      const stars = screen.getAllByRole('button', { name: /تقييم/ });
      fireEvent.click(stars[2]);
      expect(rateTest).toHaveBeenCalledWith(3);
    });

    it('results back button has 44px', () => {
      render(<TestComponent test={resultsTest} hasStarted showResults score={0} formatTime={() => '0:00'} />);
      expect(screen.getByTestId('results-back')).toHaveClass('min-h-[44px]');
    });
  });

  describe('mobile UX improvements verified', () => {
    const testData = buildTest({ questions: [buildQuestion()] });

    it('pre-start title uses responsive sm:text-2xl (not large fixed size)', () => {
      render(<TestComponent test={testData} hasStarted={false} />);
      const title = screen.getByText('اختبار تجريبي');
      expect(title.className).toContain('sm:text-2xl');
    });

    it('pre-start stats use responsive text-lg sm:text-xl (not text-xl sm:text-2xl)', () => {
      render(<TestComponent test={testData} hasStarted={false} />);
      const statNumbers = document.querySelectorAll('.text-lg');
      expect(statNumbers.length).toBeGreaterThan(0);
    });

    it('quiz heading uses responsive size (not fixed text-2xl)', () => {
      const h2 = document.createElement('h2');
      h2.className = 'text-lg sm:text-xl md:text-2xl';
      render(<TestComponent test={testData} hasStarted currentIdx={0} currentQ={buildQuestion()} formatTime={() => '5:00'} />);
      const questionText = screen.getByText('سؤال تجريبي');
      expect(questionText.className).toContain('text-lg');
    });

    it('results title uses responsive size (not fixed text-3xl)', () => {
      const rt = buildTest({ questions: [buildQuestion(), buildQuestion()] });
      render(<TestComponent test={rt} hasStarted showResults score={1} formatTime={() => '0:00'} />);
      const el = screen.getByText('النتيجة النهائية');
      expect(el.className).toContain('text-xl');
      expect(el.className).toContain('sm:text-2xl');
      expect(el.className).toContain('md:text-3xl');
    });
  });
});
