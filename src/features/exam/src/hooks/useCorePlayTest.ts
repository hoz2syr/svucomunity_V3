"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { useToast } from '@/src/components/ui/Toast';
import { CORE_PLAY_TICK_INTERVAL_MS } from '@/src/lib/constants';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { TestModel, Question } from '../types';
import { localStorageTestStorage } from '../core/storage/localStorageTestStorage';
import { fetchPublishedTestById, fetchTestByIdFromSupabase } from '../services/tests.service';
import { rateTestInSupabase } from '../services/ratings.service';

export interface UseCorePlayTestReturn {
  test: TestModel | null;
  isLoading: boolean;
  error: string | null;
  hasStarted: boolean;
  setHasStarted: (v: boolean) => void;
  immediateFeedback: boolean;
  setImmediateFeedback: (v: boolean) => void;
  currentIdx: number;
  selectedAnswers: Record<string, string | string[]>;
  showResults: boolean;
  isAnswerRevealed: boolean;
  timeLeft: number | null;
  score: number;
  currentQ: Question | null;
  isCurrentCorrect: boolean;
  handleSelect: (answer: string | string[]) => void;
  handleToggleOption: (option: string) => void;
  handleNext: () => void;
  formatTime: (seconds: number) => string;
  handleKeyDown: React.KeyboardEventHandler;
  setCurrentIdx: (idx: number) => void;
  rateTest: (stars: number) => Promise<void>;
  canRate: boolean;
}

export interface UseCorePlayTestOptions {
  publicTestId?: string;
  backPath?: string;
  onComplete?: (result: { testId: string; score: number; total: number; answers: Record<string, string | string[]> }) => void;
}

export function useCorePlayTest(testId: string | undefined, navigate: (path: string) => void, options?: UseCorePlayTestOptions): UseCorePlayTestReturn {
  const { session, envMissing } = useAuth();
  const { toast } = useToast();
  const userId = session?.user?.id ?? null;
  const backPath = options?.backPath ?? '/exam/saved';
  const onComplete = options?.onComplete;
  const [test, setTest] = useState<TestModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [immediateFeedback, setImmediateFeedback] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string | string[]>>({});
  const [showResults, setShowResults] = useState(false);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const initialTimeRef = useRef<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const publicTestId = options?.publicTestId;

  useEffect(() => {
    const fetchTestDetails = async () => {
      if (!testId) return;
      setIsLoading(true);
      setError(null);
      try {
        await new Promise(resolve => setTimeout(resolve, 600));
        if (publicTestId) {
          const { data: publishedTest, error: pubError } = await fetchPublishedTestById(publicTestId);
          if (pubError) {
            setError(pubError.message);
          } else if (publishedTest) {
            setTest(publishedTest);
          } else {
            setError('عذراً، لم يتم العثور على هذا الاختبار. ربما تم حذفه أو أن الرابط غير صحيح.');
          }
        } else {
          const found = localStorageTestStorage.getTestById(testId);
          if (found) {
            setTest(found);
          } else if (userId && !envMissing) {
            const { data: serverTest, error: serverError } = await fetchTestByIdFromSupabase(testId, userId);
            if (serverError) {
              setError(serverError.message);
            } else if (serverTest) {
              setTest(serverTest);
            } else {
              setError('عذراً، لم يتم العثور على هذا الاختبار. ربما تم حذفه أو أن الرابط غير صحيح.');
            }
          } else {
            setError('عذراً، لم يتم العثور على هذا الاختبار. ربما تم حذفه أو أن الرابط غير صحيح.');
          }
        }
      } catch {
        setError('حدث خطأ أثناء تحميل بيانات الاختبار.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTestDetails();
  }, [testId, publicTestId, navigate, userId, envMissing]);

  useEffect(() => {
    if (hasStarted && test?.settings.globalTimeLimitMinutes && initialTimeRef.current === null) {
      const seconds = test.settings.globalTimeLimitMinutes * 60;
      initialTimeRef.current = seconds;
      setTimeLeft(seconds);
    }
    if (!hasStarted) {
      initialTimeRef.current = null;
      setTimeLeft(null);
    }
  }, [hasStarted, test]);

  useEffect(() => {
    if (!hasStarted || showResults || timeLeft === null) return;
    if (timeLeft <= 0) {
      setShowResults(true);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 0) {
          setShowResults(true);
          return null;
        }
        return prev - 1;
      });
    }, CORE_PLAY_TICK_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [hasStarted, showResults, timeLeft]);

  const currentQ = test ? test.questions[currentIdx] : null;
  const isMultiSelect = currentQ?.correctAnswers && currentQ.correctAnswers.length > 0;
  const selectedValue = selectedAnswers[currentQ?.id ?? ''] as string | string[] | undefined;
  const isCurrentCorrect = useMemo(() => {
    if (!currentQ) return false;
    if (currentQ.type === 'essay') return false;
    if (isMultiSelect && Array.isArray(selectedValue)) {
      const correct = currentQ.correctAnswers ?? [];
      if (correct.length === 0) return false;
      const sortedSelected = [...selectedValue].sort();
      const sortedCorrect = [...correct].sort();
      return sortedSelected.length === sortedCorrect.length && sortedSelected.every((v, i) => v === sortedCorrect[i]);
    }
    return selectedValue === currentQ.correctAnswer;
  }, [currentQ, selectedValue, isMultiSelect]);

  const handleSelect = useCallback((rawAnswer: string | string[]) => {
    if (!isAnswerRevealed && test) {
      const answer = typeof rawAnswer === 'string' ? rawAnswer : rawAnswer[0];
      if (!answer) return;
      if (isMultiSelect) {
        setSelectedAnswers(prev => {
          const current = (prev[test.questions[currentIdx].id] as string[]) ?? [];
          if (current.includes(answer)) {
            return { ...prev, [test.questions[currentIdx].id]: current.filter(a => a !== answer) };
          }
          return { ...prev, [test.questions[currentIdx].id]: [...current, answer] };
        });
        return;
      }
      setSelectedAnswers(prev => ({ ...prev, [test.questions[currentIdx].id]: answer }));
    }
  }, [isAnswerRevealed, test, currentIdx, isMultiSelect]);

  const handleToggleOption = useCallback((option: string) => {
    handleSelect(option);
  }, [handleSelect]);

  const handleNext = useCallback(() => {
    if (!test) return;
    if (immediateFeedback && !isAnswerRevealed && test.questions[currentIdx].type !== 'essay') {
      setIsAnswerRevealed(true);
      return;
    }
    setIsAnswerRevealed(false);
    if (currentIdx < test.questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setShowResults(true);
    }
  }, [immediateFeedback, isAnswerRevealed, test, currentIdx]);

  const formatTime = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }, []);

  const handleEscapeOnWindow = useCallback((e: globalThis.KeyboardEvent) => {
    if (!hasStarted || showResults) return;
    if (e.key !== 'Escape') return;
    navigate(backPath);
  }, [hasStarted, showResults, navigate, backPath]);

  useEffect(() => {
    if (!hasStarted || showResults) return;
    const handler = (e: globalThis.KeyboardEvent) => handleEscapeOnWindow(e);
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [hasStarted, showResults, handleEscapeOnWindow]);

  const onKeyDownRaw = useCallback((e: globalThis.KeyboardEvent) => {
    if (!test || showResults) return;
    if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!isAnswerRevealed && immediateFeedback && currentQ) {
        if (currentQ.type !== 'essay' && selectedAnswers[currentQ.id]) {
          handleNext();
        }
      } else {
        handleNext();
      }
      return;
    }
    if (!isAnswerRevealed && currentQ && (e.key === 'Backspace' || e.key === 'Delete')) {
      e.preventDefault();
      setSelectedAnswers(prev => {
        const next = { ...prev };
        delete next[currentQ.id];
        return next;
      });
      setIsAnswerRevealed(false);
      return;
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (currentIdx > 0) setCurrentIdx(currentIdx - 1);
      return;
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (currentIdx < test.questions.length - 1) setCurrentIdx(currentIdx + 1);
      return;
    }
    const num = parseInt(e.key, 10);
    if (!Number.isNaN(num) && num >= 1 && num <= 9) {
      if (isAnswerRevealed || !currentQ) return;
      const opts = currentQ.type === 'true_false' ? ['true', 'false'] : currentQ.options;
      if (!opts) return;
      const choice = opts[num - 1];
      if (typeof choice === 'string') {
        e.preventDefault();
        handleSelect(choice);
      }
    }
  }, [test, showResults, isAnswerRevealed, immediateFeedback, currentQ, currentIdx, selectedAnswers, handleNext, handleSelect]);

  const handleKeyDown = useCallback((e: ReactKeyboardEvent<HTMLDivElement>) => {
    onKeyDownRaw(e.nativeEvent);
  }, [onKeyDownRaw]);

  useEffect(() => {
    if (!hasStarted || showResults) return;
    const handler = (e: globalThis.KeyboardEvent) => onKeyDownRaw(e);
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [hasStarted, showResults, onKeyDownRaw]);

  const handleRateTest = useCallback(async (stars: number) => {
    if (!test?.id) return;
    try {
      const result = await rateTestInSupabase(test.id, stars);
      if (result.error) {
        toast(result.error, 'error');
        return;
      }
      if (result.updatedRating !== undefined) {
        setTest(prev => prev ? { ...prev, rating: result.updatedRating } : prev);
      }
    } catch {
      toast('حدث خطأ أثناء إرسال التقييم.', 'error');
    }
  }, [test, toast]);

  const score = useMemo(() => {
    if (!test) return 0;
    return test.questions.reduce((acc, q) => {
      const answer = selectedAnswers[q.id];
      if (q.type === 'essay') return acc;
      if (q.correctAnswers && q.correctAnswers.length > 0 && Array.isArray(answer)) {
        const correct = [...q.correctAnswers].sort();
        const given = [...answer].sort();
        return acc + (correct.length === given.length && correct.every((v, i) => v === given[i]) ? 1 : 0);
      }
      return acc + (answer === q.correctAnswer ? 1 : 0);
    }, 0);
  }, [test, selectedAnswers]);

  const answeredCount = useMemo(() => {
    if (!test) return 0;
    return Object.keys(selectedAnswers).filter(id => {
      const answer = selectedAnswers[id];
      if (Array.isArray(answer)) return answer.length > 0;
      return !!answer && answer.trim() !== '';
    }).length;
  }, [test, selectedAnswers]);

  const canRate = useMemo(() => {
    if (!test) return false;
    const nonEssayQuestions = test.questions.filter(q => q.type !== 'essay').length;
    return nonEssayQuestions > 0 && answeredCount >= nonEssayQuestions;
  }, [test, answeredCount]);

  useEffect(() => {
    if (!showResults || !test || !onComplete) return;
    const answers: Record<string, string> = {};
    for (const [qId, value] of Object.entries(selectedAnswers)) {
      answers[qId] = Array.isArray(value) ? JSON.stringify(value) : value;
    }
    onComplete({ testId: test.id, score, total: test.questions.length, answers });
  }, [showResults, test, selectedAnswers, score, onComplete]);

  return {
    test,
    isLoading,
    error,
    hasStarted,
    setHasStarted,
    immediateFeedback,
    setImmediateFeedback,
    currentIdx,
    selectedAnswers,
    showResults,
    isAnswerRevealed,
    timeLeft,
    score,
    currentQ,
    isCurrentCorrect,
    handleSelect,
    handleToggleOption,
    handleNext,
    formatTime,
    handleKeyDown,
    setCurrentIdx,
    rateTest: handleRateTest,
    canRate,
  };
}
