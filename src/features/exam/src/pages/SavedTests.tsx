"use client";

import { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { useCoreSavedTests } from '../hooks';
import { useAuth } from '@/src/contexts/AuthContext';
import { FileText, ChevronDown, Loader2 } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { TestCardSkeleton } from '../components/Skeletons';
import { ErrorState } from '../components/ErrorState';
import { TestCard } from '../components/TestCard';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { PublishConfirmDialog } from '../components/PublishConfirmDialog';
import { GuestSharePrompt } from '../components/GuestSharePrompt';

export default function SavedTests() {
  const {
    tests,
    loadingPdf,
    isLoading,
    error,
    fetchTests,
    canDelete,
    confirmDeleteId,
    isDeleting,
    requestDelete,
    executeDelete,
    cancelDelete,
    handlePrintPdf,
    handleExportWord,
    handlePublish,
    publishingId,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCoreSavedTests();
  const { session } = useAuth();
  const [confirmPublishId, setConfirmPublishId] = useState<string | null>(null);
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  const handleRequestPublish = (testId: string) => {
    if (!session) {
      setShowGuestPrompt(true);
      return;
    }
    setConfirmPublishId(testId);
  };

  const handleConfirmPublish = async () => {
    if (!confirmPublishId) return;
    await handlePublish(confirmPublishId);
  };

  const deleteTargetTitle = confirmDeleteId
    ? tests.find(test => test.id === confirmDeleteId)?.title ?? ''
    : '';

  if (error) {
    return <ErrorState title="خطأ في تحميل البيانات" message={error} onRetry={() => fetchTests()} />;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animation-fade-in-up mt-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">اختباراتي المحفوظة</h1>
        <p className="text-secondary-400">راجع واطبع وشارك اختباراتك السابقة</p>
      </div>

      {isLoading && tests.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: Math.min(6, hasNextPage ? 6 : 0) || 6 }).map((_, index) => (
            <TestCardSkeleton key={`skeleton-${index}`} />
          ))}
        </div>
      ) : tests.length === 0 && !isLoading ? (
        <div className="glass-card flex flex-col items-center justify-center p-12 text-center">
        <div className="w-20 h-20 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center mb-4">
          <FileText className="w-10 h-10 text-secondary-500" />
        </div>
          <h3 className="text-xl font-bold text-white mb-2">لا يوجد اختبارات بعد</h3>
          <p className="text-secondary-400 mb-6">قم بإنشاء اختبارك الأول من ملف JSON الآن</p>
          <Button to="/exam/create" variant="primary" className="flex items-center gap-2">
            إنشاء اختبار
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {tests.map(test => (
              <TestCard
                key={test.id}
                test={test}
                loadingPdf={loadingPdf}
                canDelete={canDelete}
                onPrintPdf={handlePrintPdf}
                onExportWord={handleExportWord}
                onDelete={requestDelete}
                onPublish={handleRequestPublish}
                publishingId={publishingId}
              />
            ))}
          </div>

          {hasNextPage && (
            <div className="flex justify-center pt-4 pb-8">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="btn-secondary inline-flex items-center gap-2 min-w-[200px] justify-center"
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    جاري التحميل...
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    تحميل المزيد
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}

      <AnimatePresence>
        {confirmDeleteId && (
          <ConfirmDialog
            key="confirm-delete"
            isOpen={!!confirmDeleteId}
            title="تأكيد الحذف"
            message={`هل أنت متأكد من حذف "${deleteTargetTitle}"؟ لا يمكن التراجع عن هذا الإجراء.`}
            confirmLabel="حذف"
            cancelLabel="إلغاء"
            onConfirm={executeDelete}
            onCancel={cancelDelete}
            isLoading={isDeleting}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmPublishId && (
          <PublishConfirmDialog
            key="confirm-publish"
            testTitle={tests.find(test => test.id === confirmPublishId)?.title ?? ''}
            testId={confirmPublishId}
            isOpen={!!confirmPublishId}
            onConfirm={handleConfirmPublish}
            onCancel={() => { setConfirmPublishId(null); }}
            isLoading={publishingId === confirmPublishId}
          />
        )}
      </AnimatePresence>

      <GuestSharePrompt open={showGuestPrompt} onClose={() => setShowGuestPrompt(false)} />
    </div>
  );
}
