"use client";

import { useState, useEffect, useCallback } from 'react';
import { TestModel } from '../types';
import { getTests, deleteTest, saveTest } from '../lib/store';
import { exportToPdf, exportToWord } from '../lib/export';
import { upsertTestToSupabase } from '../services/exam.supabase';
import { hasSupabaseEnv, missingSupabaseEnvMessage } from '@/src/lib/supabase';
import { useAuth } from '@/src/contexts/AuthContext';

export interface UseSavedTestsReturn {
  tests: TestModel[];
  loadingPdf: string | null;
  isLoading: boolean;
  error: string | null;
  fetchTests: () => Promise<void>;
  requestDelete: (id: string) => void;
  executeDelete: () => Promise<void>;
  cancelDelete: () => void;
  canDelete: boolean;
  handlePrintPdf: (test: TestModel) => Promise<void>;
  handleExportWord: (test: TestModel) => Promise<void>;
  handlePublish: (testId: string) => Promise<void>;
  publishingId: string | null;
  publishError: string | null;
}

export function useSavedTests(): UseSavedTestsReturn {
  const [tests, setTests] = useState<TestModel[]>([]);
  const [loadingPdf, setLoadingPdf] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);

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

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [titleCache, setTitleCache] = useState<Record<string, string>>({});

  const requestDelete = useCallback((id: string) => {
    setConfirmDeleteId(id);
  }, []);

  const cancelDelete = useCallback(() => {
    setConfirmDeleteId(null);
  }, []);

  const executeDelete = useCallback(async () => {
    if (!confirmDeleteId) return;
    setIsDeleting(true);
    try {
      deleteTest(confirmDeleteId);
      await fetchTests();
    } finally {
      setIsDeleting(false);
      setConfirmDeleteId(null);
    }
  }, [confirmDeleteId, fetchTests]);

  const handlePrintPdf = useCallback(async (test: TestModel) => {
    setLoadingPdf(test.id);
    try {
      await exportToPdf(test);
    } catch {
      console.error('Failed to export PDF');
      alert('حدث خطأ أثناء تصدير ملف PDF');
    } finally {
      setLoadingPdf(null);
    }
  }, []);

  const handleExportWord = useCallback(async (test: TestModel) => {
    try {
      await exportToWord(test);
    } catch {
      console.error('Failed to export Word');
      alert('حدث خطأ أثناء تصدير ملف Word');
    }
  }, []);

  const handlePublish = useCallback(async (testId: string) => {
    setPublishingId(testId);
    setPublishError(null);

    try {
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
      setTests(stored.map(t => t.id === testId ? updated : t));

      if (hasSupabaseEnv()) {
        await upsertTestToSupabase(updated as TestModel & { userId: string });
      }
    } catch {
      setPublishError('لم يتم النشر. حاول مرة أخرى لاحقاً.');
    } finally {
      setPublishingId(null);
    }
  }, []);

  return {
    tests,
    loadingPdf,
    isLoading,
    error,
    fetchTests,
    requestDelete,
    executeDelete,
    cancelDelete,
    canDelete: true,
    handlePrintPdf,
    handleExportWord,
    handlePublish,
    publishingId,
    publishError,
  };
}
