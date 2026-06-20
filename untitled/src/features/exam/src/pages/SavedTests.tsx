"use client";

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCoreSavedTests } from '../hooks';
import { FileText, Trash2, Printer, Download } from 'lucide-react';
import { TestCardSkeleton } from '../components/Skeletons';
import { ErrorState } from '../components/ErrorState';
import { TestCard } from '../components/TestCard';

export default function SavedTests() {
  const { tests, loadingPdf, isLoading, error, fetchTests, handleDelete, handlePrintPdf, handleExportWord } = useCoreSavedTests();

  useEffect(() => {
    fetchTests('local-user');
  }, [fetchTests]);

  if (error) {
    return <ErrorState title="خطأ في تحميل البيانات" message={error} onRetry={() => fetchTests('local-user')} />;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animation-fade-in-up">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">اختباراتي المحفوظة</h1>
        <p className="text-secondary-400">راجع واطبع وشارك اختباراتك السابقة</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <TestCardSkeleton key={`skeleton-${i}`} />
          ))}
        </div>
      ) : tests.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-secondary-800 flex items-center justify-center mb-4">
            <FileText className="w-10 h-10 text-secondary-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">لا يوجد اختبارات بعد</h3>
          <p className="text-secondary-400 mb-6">قم بإنشاء اختبارك الأول من ملف JSON الآن</p>
          <Link to="/exam/create" className="btn-primary flex items-center gap-2">إنشاء اختبار</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {tests.map((test) => (
            <TestCard
              key={test.id}
              test={test}
              loadingPdf={loadingPdf}
              onPrintPdf={handlePrintPdf}
              onExportWord={handleExportWord}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
