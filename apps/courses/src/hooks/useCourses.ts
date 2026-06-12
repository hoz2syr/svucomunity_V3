/**
 * ════════════════════════════════════════════════════════════════
 * useCourses — جلب المواد الدراسية النشطة من Supabase
 * يعيد محاولة الجلب تلقائياً (retry + exponential backoff) عند الفشل
 * ════════════════════════════════════════════════════════════════
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import type { SupabaseCourse } from '../types';

export { type SupabaseCourse as Course };

export function useCourses() {
  const [courses, setCourses] = useState<SupabaseCourse[]>([]);
  const [majors, setMajors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async (retryCount = 0): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('courses')
        .select('id, code, name, name_ar, major, description, is_active, created_at')
        .eq('is_active', true)
        .order('major', { ascending: true })
        .order('code', { ascending: true });

      if (fetchError) throw fetchError;

      const coursesData: SupabaseCourse[] = data ?? [];

      setCourses(coursesData);

      const majorsFromCourses = [...new Set(coursesData.map((c) => c.major))].sort();
      setMajors(majorsFromCourses);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'فشل تحميل المواد';
      console.error('[useCourses]', message, err);
      if (retryCount < 2) {
        const delay = 2000 * (retryCount + 1);
        setTimeout(() => fetchCourses(retryCount + 1), delay);
        return;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return { courses, majors, loading, error, refetch: fetchCourses };
}
