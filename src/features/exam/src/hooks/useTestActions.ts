"use client";

import { useState, useCallback } from 'react';
import type { TestModel } from '../types';
import { exportToPdf, exportToWord } from '../lib/export';

export interface UseTestActionsOptions {
  onPublish: (testId: string) => Promise<void>;
  onDelete: (testId: string) => Promise<void>;
}

export interface UseTestActionsReturn {
  loadingPdf: string | null;
  confirmDeleteId: string | null;
  isDeleting: boolean;
  publishingId: string | null;
  publishError: string | null;
  handlePrintPdf: (test: TestModel) => Promise<void>;
  handleExportWord: (test: TestModel) => Promise<void>;
  handlePublish: (testId: string) => Promise<void>;
  requestDelete: (id: string) => void;
  cancelDelete: () => void;
  executeDelete: () => Promise<void>;
}

export function useTestActions({
  onPublish,
  onDelete,
}: UseTestActionsOptions): UseTestActionsReturn {
  const [loadingPdf, setLoadingPdf] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);

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
      await onDelete(confirmDeleteId);
    } catch {
      alert('حدث خطأ أثناء الحذف.');
    } finally {
      setIsDeleting(false);
      setConfirmDeleteId(null);
    }
  }, [confirmDeleteId, onDelete]);

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
      await onPublish(testId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'لم يتم النشر. حاول مرة أخرى لاحقاً.';
      setPublishError(message);
    } finally {
      setPublishingId(null);
    }
  }, [onPublish]);

  return {
    loadingPdf,
    confirmDeleteId,
    isDeleting,
    publishingId,
    publishError,
    handlePrintPdf,
    handleExportWord,
    handlePublish,
    requestDelete,
    cancelDelete,
    executeDelete,
  };
}
