"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { fetchUserAttemptHistory, saveTestAttempt } from '../services/exam.supabase';

export interface UseTestAttemptsReturn {
  attempts: import('../types').TestAttempt[];
  isLoading: boolean;
  error: string | null;
  saveAttempt: (testId: string, score: number, total: number, answers: Record<string, string>) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useTestAttempts(): UseTestAttemptsReturn {
  const { session, loading: authLoading, envMissing } = useAuth();
  const userId = session?.user?.id ?? null;
  const [attempts, setAttempts] = useState<import('../types').TestAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAttempts = useCallback(async () => {
    if (!userId || envMissing) {
      setAttempts([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await fetchUserAttemptHistory(userId);
      if (fetchError) {
        setError(fetchError.message);
        setAttempts([]);
      } else {
        setAttempts(data ?? []);
      }
    } catch {
      setError('حدث خطأ أثناء تحميل سجل المحاولات.');
      setAttempts([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId, envMissing]);

  useEffect(() => {
    fetchAttempts();
  }, [fetchAttempts]);

  const saveAttemptAction = useCallback(async (testId: string, score: number, total: number, answers: Record<string, string>) => {
    if (!userId && !envMissing) {
      const fresh = await (await import('@/src/lib/supabase')).getCurrentSession();
      const uid = fresh?.user?.id;
      if (!uid) {
        setError('يجب تسجيل الدخول لحفظ النتيجة.');
        return;
      }
      const { error: saveError } = await saveTestAttempt({ testId, userId: uid, score, total, answers });
      if (saveError) {
        setError(saveError.message);
        return;
      }
      setAttempts(prev => [{
        id: crypto.randomUUID(),
        testId,
        userId: uid,
        score,
        total,
        answers,
        completedAt: new Date().toISOString(),
      }, ...prev]);
      return;
    }

    if (!userId) {
      setError('يجب تسجيل الدخول لحفظ النتيجة.');
      return;
    }

    const { error: saveError } = await saveTestAttempt({ testId, userId, score, total, answers });
    if (saveError) {
      setError(saveError.message);
      return;
    }

    const newAttempt: import('../types').TestAttempt = {
      id: crypto.randomUUID(),
      testId,
      userId,
      score,
      total,
      answers,
      completedAt: new Date().toISOString(),
    };

    setAttempts(prev => [newAttempt, ...prev]);
  }, [userId, envMissing]);

  return {
    attempts,
    isLoading: isLoading || authLoading,
    error,
    saveAttempt: saveAttemptAction,
    refetch: fetchAttempts,
  };
}
