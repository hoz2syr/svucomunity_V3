"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { TestModel } from '../types';
import { localStorageTestStorage } from '../core/adapters/localStorageTestStorage';
import { supabaseStorage } from '../core/adapters/supabaseTestStorage';
import { exportToPdf, exportToWord } from '../lib/export';
import { useAuth } from '@/src/contexts/AuthContext';
import { fetchTestsFromSupabase, upsertTestToSupabase, deleteTestFromSupabase } from '../services/exam.supabase';
import { hasSupabaseEnv, missingSupabaseEnvMessage } from '@/src/lib/supabase';

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

export function useCoreSavedTests(): UseSavedTestsReturn {
  const { session, loading: authLoading, envMissing } = useAuth();
  const [tests, setTests] = useState<TestModel[]>([]);
  const [loadingPdf, setLoadingPdf] = useState<string | null>(null);
  const [isLoadingState, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const prevUserIdRef = useRef<string | null>(null);
  const userId = session?.user?.id ?? null;
  const storage = userId ? supabaseStorage : localStorageTestStorage;
  const canDelete = !!userId;

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
      const { data: serverTests, error } = await fetchTestsFromSupabase(userId);
      if (error) {
        throw new Error(error.message);
      }

      const safeTests = Array.isArray(serverTests) ? serverTests : [];
      storage.hydrateFromServer(userId, safeTests);
      setTests(storage.getTests());
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setError(message || 'تعذر جلب الاختبارات المحفوظة.');
      setTests([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId, storage]);

  useEffect(() => {
    const prev = prevUserIdRef.current;
    prevUserIdRef.current = userId;

    if (!prev && userId && hasSupabaseEnv()) {
      const localTests = localStorageTestStorage.getTests();
      if (localTests.length === 0) return;

      fetchTestsFromSupabase(userId).then(({ data: serverTests, error }) => {
        if (error) {
          console.error('Migration prefetch failed:', error);
          return;
        }
        const serverIds = new Set((serverTests ?? []).map(t => t.id));
        const unsaved = localTests.filter(t => !serverIds.has(t.id));

        Promise.all(
          unsaved.map(t => upsertTestToSupabase({ ...t, userId }))
        ).finally(() => {
          fetchTests();
        });
      }).catch(() => {
        fetchTests();
      });
    }
  }, [userId, fetchTests]);

  const requestDelete = useCallback((id: string) => {
    setConfirmDeleteId(id);
  }, []);

  const executeDelete = useCallback(async () => {
    const id = confirmDeleteId;
    if (!id) return;

    setIsDeleting(true);
    try {
      storage.deleteTest(id);
      setTests([...storage.getTests()]);
    } catch {
      alert('حدث خطأ أثناء الحذف.');
    } finally {
      setIsDeleting(false);
      setConfirmDeleteId(null);
    }
  }, [confirmDeleteId, storage]);

  const cancelDelete = useCallback(() => {
    setConfirmDeleteId(null);
  }, []);

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
      const currentTests = storage.getTests();
      const existing = currentTests.find(t => t.id === testId);
      if (!existing) {
        throw new Error('الاختبار غير موجود');
      }

      const updated: TestModel = {
        ...existing,
        published: true,
        publishedAt: existing.publishedAt ?? new Date().toISOString(),
      };

      storage.saveTest(updated);
      setTests(currentTests.map(t => t.id === testId ? updated : t));

      if (userId && hasSupabaseEnv()) {
        await upsertTestToSupabase({ ...updated, userId });
      }
    } catch {
      setPublishError('لم يتم النشر. حاول مرة أخرى لاحقاً.');
    } finally {
      setPublishingId(null);
    }
  }, [userId, storage]);

  return {
    tests,
    loadingPdf,
    isLoading: isLoadingState || authLoading,
    error,
    canDelete,
    confirmDeleteId,
    isDeleting,
    fetchTests,
    requestDelete,
    executeDelete,
    cancelDelete,
    handlePrintPdf,
    handleExportWord,
    handlePublish,
    publishingId,
    publishError,
  };
}
