/**
 * ════════════════════════════════════════════════════════════════
 * useCourseResources — جلب الموارد الدراسية لمادة محددة
 * يتضمن منطق إعادة المحاولة مع تأخير أسى (retry + backoff)
 * ════════════════════════════════════════════════════════════════
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../services/supabase';
import type { SupabaseResource } from '../types';

export type { SupabaseResource as Resource } from '../types';

export function useCourseResources(courseCode: string | null) {
  const [resources, setResources] = useState<SupabaseResource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const retryTimer = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchResources = useCallback(async (code: string, retryCount = 0): Promise<void> => {
    const controller = new AbortController();
    abortControllerRef.current = controller;

    if (retryTimer.current !== null) {
      clearTimeout(retryTimer.current);
      retryTimer.current = null;
    }

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

      setResources((data ?? []) as SupabaseResource[]);
    } catch (err) {
      if (controller.signal.aborted) return;
      const message = err instanceof Error ? err.message : 'فشل تحميل الموارد';
      console.error('[useCourseResources]', message, err);
      if (retryCount < 2 && typeof window !== 'undefined') {
        retryTimer.current = window.setTimeout(() => fetchResources(code, retryCount + 1), 2000 * (retryCount + 1));
      } else {
        setError(message);
      }
    } finally {
      if (abortControllerRef.current === controller) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    abortControllerRef.current = controller;

    if (!courseCode) {
      setResources([]);
      setError(null);
      return;
    }

    fetchResources(courseCode);

    return () => {
      controller.abort();
      abortControllerRef.current = null;
      if (retryTimer.current !== null) {
        clearTimeout(retryTimer.current);
        retryTimer.current = null;
      }
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
