"use client";

import { useState, useEffect, useCallback } from 'react';
import { TestModel } from '../types';
import { getTests, deleteTest, saveTest } from '../lib/store';
import { upsertTestToSupabase } from '../services/exam.supabase';
import { hasSupabaseEnv } from '@/src/lib/supabase';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTestActions } from './useTestActions';

export interface UseSavedTestsReturn {
  tests: TestModel[];
  loadingPdf: string | null;
  isLoading: boolean;
  error: string | null;
  canDelete: boolean;
  confirmDeleteId: string | null;
  isDeleting: boolean;
  fetchTests: () => Promise<void>;
  requestDelete: (id: string) => void;
  executeDelete: () => Promise<void>;
  cancelDelete: () => void;
  handlePrintPdf: (test: TestModel) => Promise<void>;
  handleExportWord: (test: TestModel) => Promise<void>;
  handlePublish: (testId: string) => Promise<void>;
  publishingId: string | null;
  publishError: string | null;
}

export function useSavedTests(): UseSavedTestsReturn {
  const { session } = useAuth();
  const [tests, setTests] = useState<TestModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTests = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setTests(getTests());
    } catch {
      setError('تعذر جلب الاختبارات المحفوظة. يرجى التأكد من اتصالك بالإنترنت والمحاولة مجدداً.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  const handlePublish = useCallback(async (testId: string) => {
    const stored = getTests();
    const existing = stored.find(t => t.id === testId);
    if (!existing) {
      throw new Error('الاختبار غير موجود');
    }

    const updated: TestModel = {
      ...existing,
      published: true,
      publishedAt: existing.publishedAt ?? new Date().toISOString(),
    };

    saveTest(updated);
    setTests(stored.map(t => (t.id === testId ? updated : t)));

    if (hasSupabaseEnv() && session?.user?.id) {
      await upsertTestToSupabase({ ...updated, userId: session.user.id });
    }
  }, [session]);

  const executeDelete = useCallback(async (testId: string) => {
    deleteTest(testId);
    await fetchTests();
  }, [fetchTests]);

  const actions = useTestActions({
    onPublish: handlePublish,
    onDelete: executeDelete,
  });

  return {
    tests,
    loadingPdf: actions.loadingPdf,
    isLoading,
    error,
    fetchTests,
    canDelete: true,
    confirmDeleteId: actions.confirmDeleteId,
    isDeleting: actions.isDeleting,
    requestDelete: actions.requestDelete,
    executeDelete: actions.executeDelete,
    cancelDelete: actions.cancelDelete,
    handlePrintPdf: actions.handlePrintPdf,
    handleExportWord: actions.handleExportWord,
    handlePublish: actions.handlePublish,
    publishingId: actions.publishingId,
    publishError: actions.publishError,
  };
}
