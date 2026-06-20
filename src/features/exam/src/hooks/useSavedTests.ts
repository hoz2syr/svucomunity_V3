"use client";

import { useState, useEffect, useCallback } from 'react';
import { TestModel } from '../types';
import { getTests, deleteTest } from '../lib/store';
import { exportToPdf, exportToWord } from '../lib/export';

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

export function useSavedTests(): UseSavedTestsReturn {
  const [tests, setTests] = useState<TestModel[]>([]);
  const [loadingPdf, setLoadingPdf] = useState<string | null>(null);
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

  const handleDelete = useCallback(async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الاختبار؟')) {
      deleteTest(id);
      await fetchTests();
    }
  }, [fetchTests]);

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

  return {
    tests,
    loadingPdf,
    isLoading,
    error,
    fetchTests,
    handleDelete,
    handlePrintPdf,
    handleExportWord,
  };
}
