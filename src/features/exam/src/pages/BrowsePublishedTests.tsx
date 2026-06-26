"use client";

import { Link } from 'react-router-dom';
import { usePublishedTests } from '../hooks';
import { FileText, ChevronDown, Loader2, Globe } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { TestCardSkeleton } from '../components/Skeletons';
import { ErrorState } from '../components/ErrorState';
import { StarRating } from '../components/StarRating';
import { PrivacyBadge } from '../components/PrivacyBadge';
import { PublishedTestsFilters } from '../../components/PublishedTestsFilters';
import type { TestModel } from '../types';

export default function BrowsePublishedTests() {
  const { tests, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage, refetch, majors, selectedMajor, selectedCourse, searchQuery, searchInput, setSelectedMajor, setSelectedCourse, setSearchInput, triggerSearch, clearFilters, courses } = usePublishedTests();

  return (
    <div className="max-w-6xl mx-auto space-y-6 animation-fade-in-up mt-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Globe className="w-8 h-8 text-cyan-400" />
          <h1 className="text-3xl font-bold text-white">الاختبارات المنشورة</h1>
        </div>
        <p className="text-secondary-400">تصفح الاختبارات المنشورة من قبل المستخدمين</p>
      </div>

      <PublishedTestsFilters
        majors={majors}
        courses={courses}
        selectedMajor={selectedMajor}
        selectedCourse={selectedCourse}
        searchQuery={searchQuery}
        searchInput={searchInput}
        onMajorChange={setSelectedMajor}
        onCourseChange={setSelectedCourse}
        onSearchInputChange={setSearchInput}
        onSearchTrigger={triggerSearch}
        onClearFilters={clearFilters}
      />

      {error ? (
        <ErrorState title="خطأ في تحميل البيانات" message={error} onRetry={() => refetch()} />
      ) : isLoading && tests.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <TestCardSkeleton key={`skeleton-${index}`} />
          ))}
        </div>
      ) : tests.length === 0 && !isLoading ? (
        <div className="glass-card flex flex-col items-center justify-center p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center mb-4">
            <FileText className="w-10 h-10 text-secondary-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">لا توجد اختبارات منشورة بعد</h3>
          <p className="text-secondary-400 mb-6">كن أول من ينشر اختباراً!</p>
          <Button to="/exam/create" variant="primary" className="flex items-center gap-2">
            إنشاء اختبار
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {tests.map((test) => (
              <PublishedTestCard key={test.id} test={test} />
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
    </div>
  );
}

function PublishedTestCard({ test }: { test: TestModel }) {
  return (
    <div
      className="bg-[var(--color-bg-card)] backdrop-blur-xl border border-[var(--color-glass-border)] flex flex-col h-full rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[var(--shadow-glow-cyan)] hover:border-[var(--color-glass-hover-border)]"
    >
      <div className="flex-1 p-5 pb-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-lg font-bold text-white leading-snug line-clamp-2">{test.title}</h3>
          <PrivacyBadge published={test.published} />
        </div>

        {test.description && (
          <p className="text-secondary-400 text-sm mb-4 leading-relaxed line-clamp-2 min-h-[2.5rem]">
            {test.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span className="inline-flex items-center gap-1.5 bg-[var(--color-bg-elevated)]/70 text-[var(--color-text-secondary)] text-xs font-medium px-2.5 py-1.5 rounded-lg border border-white/5">
            <FileText className="w-3.5 h-3.5 text-primary-400" />
            <span>{test.questions.length} سؤال</span>
          </span>
          <span className="inline-flex items-center gap-1.5 bg-[var(--color-bg-elevated)]/70 text-[var(--color-text-secondary)] text-xs font-medium px-2.5 py-1.5 rounded-lg border border-white/5">
            <Globe className="w-3.5 h-3.5 text-primary-400" />
            <span>{new Date(test.createdAt).toLocaleDateString('ar-SA')}</span>
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <StarRating rating={test.rating ?? 0} readonly size={16} onRate={() => {}} />
          {test.rating ? (
            <span className="text-xs text-[var(--color-text-muted)]">{test.rating}/5</span>
          ) : (
            <span className="text-xs text-[var(--color-text-muted)]">غير مقيم</span>
          )}
        </div>
      </div>

        <div className="flex flex-col gap-2 p-5 pt-2 border-t border-[var(--color-glass-border)] bg-[var(--color-bg-card)]">
        <Link
          to={`/exam/shared/${test.id}`}
          className="btn-accent w-full py-2.5 text-sm flex items-center justify-center gap-2 rounded-xl shadow-lg shadow-primary-900/20 hover:shadow-primary-800/30 transition-all"
        >
          <Globe className="w-4 h-4" />
          <span className="font-medium">خوض الاختبار</span>
        </Link>
      </div>
    </div>
  );
}
