/**
 * ════════════════════════════════════════════════════════════════
 * useCourses — جلب المواد الدراسية النشطة من Supabase
 * يعيد محاولة الجلب تلقائياً (retry + exponential backoff) عند الفشل
 * ════════════════════════════════════════════════════════════════
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../services/supabase';
import type { SupabaseCourse } from '../types';

export { type SupabaseCourse as Course };

interface UseCoursesResult {
  courses: SupabaseCourse[];
  majors: string[];
  loading: boolean;
  error: string | null;
  refetch: (retryCount?: number) => Promise<void>;
  page: number;
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
  loadMore: () => void;
}

export function useCourses(page = 1, pageSize = 20): UseCoursesResult {
  const [courses, setCourses] = useState<SupabaseCourse[]>([]);
  const [majors, setMajors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(page);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);
  const [totalCount, setTotalCount] = useState(0);
  const retryTimer = useRef<number | null>(null);

  const fetchCourses = useCallback(async (retryCount = 0): Promise<void> => {
    const controller = new AbortController();
    try {
      setLoading(true);
      setError(null);

      const from = (currentPage - 1) * currentPageSize;
      const to = currentPage * currentPageSize - 1;

      const { data, error: fetchError, count } = await supabase
        .from('courses')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .range(from, to)
        .order('major', { ascending: true })
        .order('code', { ascending: true });

      if (fetchError) throw fetchError;
      if (controller.signal.aborted) return;

      const coursesData: SupabaseCourse[] = data ?? [];
      const total = count ?? 0;

      setCourses(coursesData);
      setTotalCount(total);

      const majorsFromCourses = [...new Set(coursesData.map((c) => c.major))].sort();
      setMajors(majorsFromCourses);
    } catch (err) {
      if (controller.signal.aborted) return;
      const message = err instanceof Error ? err.message : 'فشل تحميل المواد';
      console.error('[useCourses]', message, err);
      if (retryCount < 2) {
        const delay = 2000 * (retryCount + 1);
        retryTimer.current = window.setTimeout(() => fetchCourses(retryCount + 1), delay);
        return;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, currentPageSize]);

  useEffect(() => {
    const controller = new AbortController();
    fetchCourses();
    // AbortController cleanup prevents state updates after unmount
    return () => {
      controller.abort();
      if (retryTimer.current) window.clearTimeout(retryTimer.current);
    };
  }, [fetchCourses]);

  const loadMore = useCallback(() => {
    setCurrentPage((prev) => prev + 1);
  }, []);

  return {
    courses,
    majors,
    loading,
    error,
    refetch: fetchCourses,
    page: currentPage,
    pageSize: currentPageSize,
    totalCount,
    hasNextPage: currentPage * currentPageSize < totalCount,
    loadMore,
  };
}
