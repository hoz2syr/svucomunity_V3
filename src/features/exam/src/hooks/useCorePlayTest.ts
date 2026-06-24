"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { TestModel, Question } from '../types';
import { localStorageTestStorage } from '../core/storage/localStorageTestStorage';
import { fetchPublishedTestById, rateTestInSupabase } from '../services/exam.supabase';

export interface UseCorePlayTestReturn {
  test: TestModel | null;
  isLoading: boolean;
  error: string | null;
  hasStarted: boolean;
  setHasStarted: (v: boolean) => void;
  immediateFeedback: boolean;
  setImmediateFeedback: (v: boolean) => void;
  currentIdx: number;
  selectedAnswers: Record<string, string>;
  showResults: boolean;
  isAnswerRevealed: boolean;
  timeLeft: number | null;
  score: number;
  currentQ: Question | null;
  isCurrentCorrect: boolean;
  handleSelect: (answer: string) => void;
  handleNext: () => void;
  formatTime: (seconds: number) => string;
  handleKeyDown: React.KeyboardEventHandler;
  setCurrentIdx: (idx: number) => void;
  rateTest: (stars: number) => Promise<void>;
  canRate: boolean;
}

export interface UseCorePlayTestOptions {
  publicTestId?: string;
}

export function useCorePlayTest(testId: string | undefined, navigate: (path: string) => void, options?: UseCorePlayTestOptions): UseCorePlayTestReturn {
  const [test, setTest] = useState<TestModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [immediateFeedback, setImmediateFeedback] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
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
  }, [testId, publicTestId, navigate]);

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
    }, 1000);
    return () => clearInterval(timer);
  }, [hasStarted, showResults]);

  const currentQ = test ? test.questions[currentIdx] : null;
  const isCurrentCorrect = currentQ ? selectedAnswers[currentQ.id] === currentQ.correctAnswer : false;

  const handleSelect = useCallback((answer: string) => {
    if (!isAnswerRevealed && test) {
      setSelectedAnswers(prev => ({ ...prev, [test.questions[currentIdx].id]: answer }));
    }
  }, [isAnswerRevealed, test, currentIdx]);

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
    navigate('/exam/saved');
  }, [hasStarted, showResults, navigate]);

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
        window.alert(result.error);
        return;
      }
      if (result.updatedRating !== undefined) {
        setTest(prev => prev ? { ...prev, rating: result.updatedRating } : prev);
      }
    } catch {
      window.alert('حدث خطأ أثناء إرسال التقييم.');
    }
  }, [test]);

  const score = useMemo(() => {
    if (!test) return 0;
    return test.questions.reduce((acc, q) => acc + (selectedAnswers[q.id] === q.correctAnswer ? 1 : 0), 0);
  }, [test, selectedAnswers, showResults]);

  const answeredCount = useMemo(() => {
    if (!test) return 0;
    return Object.keys(selectedAnswers).filter(id => {
      const answer = selectedAnswers[id];
      return !!answer && answer.trim() !== '';
    }).length;
  }, [test, selectedAnswers]);

  const canRate = useMemo(() => answeredCount >= 1, [answeredCount]);

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
    handleNext,
    formatTime,
    handleKeyDown,
    setCurrentIdx,
    rateTest: handleRateTest,
    canRate,
  };
}
