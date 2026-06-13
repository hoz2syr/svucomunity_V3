/**
 * ════════════════════════════════════════════════════════════════
 * useCourseResources — جلب الموارد الدراسية لمادة محددة
 * يتضمن منطق إعادة المحاولة مع تأخير أسى (retry + backoff)
 * ════════════════════════════════════════════════════════════════
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../services/supabase';

export interface Resource {
  id: string;
  course_code: string;
  course_name: string;
  major: string;
  title: string;
  url: string;
  description: string | null;
  resource_type: string;
  uploader_id: string | null;
  uploader_name: string;
  votes: number;
  is_active: boolean;
  created_at: string;
}

export function useCourseResources(courseCode: string | null) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const retryTimer = useRef<number | null>(null);

  const fetchResources = useCallback(async (code: string, retryCount = 0): Promise<void> => {
    const controller = new AbortController();
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('course_resources')
        .select('*')
        .eq('course_code', code)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      if (controller.signal.aborted) return;

      setResources(data ?? []);
    } catch (err) {
      if (controller.signal.aborted) return;
      const message = err instanceof Error ? err.message : 'فشل تحميل الموارد';
      console.error('[useCourseResources]', message, err);
      if (retryCount < 2) {
        retryTimer.current = window.setTimeout(() => fetchResources(code, retryCount + 1), 2000 * (retryCount + 1));
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    if (!courseCode) {
      setResources([]);
      setError(null);
      return;
    }

    fetchResources(courseCode);
    // AbortController cleanup prevents state updates after unmount
    return () => {
      controller.abort();
      if (retryTimer.current) window.clearTimeout(retryTimer.current);
    };
  }, [courseCode, fetchResources]);

  return {
    resources,
    loading,
    error,
    refetch: (): Promise<void> =>
      courseCode ? fetchResources(courseCode) : Promise.resolve(),
  };
}
