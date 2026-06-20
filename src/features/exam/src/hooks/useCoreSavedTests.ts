"use client";

import { useState, useEffect, useCallback } from 'react';
import { TestModel } from '../types';
import { localStorageTestStorage } from '../core/adapters/localStorageTestStorage';
import { supabaseStorage } from '../core/adapters/supabaseTestStorage';
import { exportToPdf, exportToWord } from '../lib/export';
import { useAuth } from '@/src/contexts/AuthContext';

export interface UseSavedTestsReturn {
  tests: TestModel[];
  loadingPdf: string | null;
  isLoading: boolean;
  error: string | null;
  fetchTests: () => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
  handlePrintPdf: (test: TestModel) => Promise<void>;
  handleExportWord: (test: TestModel) => Promise<void>;
}

export function useCoreSavedTests(): UseSavedTestsReturn {
  const { session, loading: authLoading, envMissing } = useAuth();
  const [tests, setTests] = useState<TestModel[]>([]);
  const [loadingPdf, setLoadingPdf] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = session?.user?.id ?? null;
  const storage = userId ? supabaseStorage : localStorageTestStorage;

  const fetchTests = useCallback(async () => {
    if (!userId) {
      storage.setCurrentUserId(null);
      setTests(localStorageTestStorage.getTests());
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      storage.setCurrentUserId(userId);
      const response = await fetch('/api/exam/tests', {
        headers: { 'x-user-id': userId },
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !Array.isArray(data)) {
        throw new Error(data?.message || response.statusText || 'تعذر جلب الاختبارات المحفوظة.');
      }

      const serverTests = (data ?? []) as TestModel[];
      storage.hydrateFromServer(userId, serverTests);
      setTests(storage.getTests());
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setError(message || 'تعذر جلب الاختبارات المحفوظة.');
      setTests([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId, storage]);

  const handleDelete = useCallback(async (id: string) => {
    const activeUserId = storage.getCurrentUserId();
    if (!activeUserId && !window.confirm('هل أنت متأكد من حذف هذا الاختبار؟')) {
      return;
    }

    try {
      storage.deleteTest(id);
      setTests(storage.getTests());
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      alert(message || 'حدث خطأ أثناء الحذف.');
    }
  }, [storage]);

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

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  return {
    tests,
    loadingPdf,
    isLoading: isLoading || authLoading,
    error,
    fetchTests,
    handleDelete,
    handlePrintPdf,
    handleExportWord,
  };
}
