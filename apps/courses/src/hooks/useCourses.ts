import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@supabase/supabase-client/src/client';

export type SupabaseCourse = {
  id: string;
  code: string;
  name: string;
  name_ar: string | null;
  major: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
};

export function useCourses() {
  const [courses, setCourses] = useState<SupabaseCourse[]>([]);
  const [majors, setMajors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async (retryCount = 0) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('courses')
        .select('*')
        .eq('is_active', true)
        .order('major', { ascending: true })
        .order('code', { ascending: true });

      if (fetchError) throw fetchError;

      const coursesData = data ?? [];
      setCourses(coursesData);

      const uniqueMajors = [...new Set(coursesData.map((c) => c.major))];
      setMajors(uniqueMajors);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'فشل تحميل المواد';
      console.error('[useCourses]', message, err);
      if (retryCount < 2) {
        setTimeout(() => fetchCourses(retryCount + 1), 2000 * (retryCount + 1));
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
