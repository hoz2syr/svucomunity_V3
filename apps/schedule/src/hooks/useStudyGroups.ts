import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { supabase } from '../services/supabase';
import type { StudyGroup } from '../services/types';

interface UseStudyGroupsOptions {
  courseCodes: string[];
  enabled: boolean;
}

interface UseStudyGroupsReturn {
  availableGroups: Record<string, StudyGroup[]>;
  fetchError: string | null;
  hasMore: Record<string, boolean>;
  isLoadingMore: Record<string, boolean>;
  loadMore: (courseCode: string) => Promise<void>;
}

export function useStudyGroups({ courseCodes, enabled }: UseStudyGroupsOptions): UseStudyGroupsReturn {
  const PAGE_SIZE = 30;
  const [availableGroups, setAvailableGroups] = useState<Record<string, StudyGroup[]>>({});
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [offsets, setOffsets] = useState<Record<string, number>>({});
  const [hasMore, setHasMore] = useState<Record<string, boolean>>({});
  const [isLoadingMore, setIsLoadingMore] = useState<Record<string, boolean>>({});

  const isFetchingRef = useRef(false);
  const uniqueCourseCodes = useMemo(
    () => Array.from(new Set(courseCodes)),
    [courseCodes]
  );

  const loadMore = useCallback(async (courseCode: string) => {
    if (isLoadingMore[courseCode] || !hasMore[courseCode]) return;
    setIsLoadingMore((prev) => ({ ...prev, [courseCode]: true }));
    setFetchError(null);

    try {
      const offset = offsets[courseCode] || 0;
      const { data, error: fetchError } = await supabase
        .from('study_groups')
        .select('id,course_code,course_name,name,description,creator_id,members,created_at')
        .eq('course_code', courseCode)
        .order('created_at', { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);

      if (fetchError) {
        console.error('[Supabase] Error loading more groups:', fetchError);
        setFetchError('Failed to load more groups. Please try again.');
        return;
      }

      const newGroups = (data || []).map((row) => ({
        id: row.id,
        courseCode: row.course_code,
        courseName: row.course_name,
        name: row.name,
        description: row.description,
        creatorId: row.creator_id,
        members: row.members || [],
        createdAt: row.created_at,
      })) as StudyGroup[];

      setAvailableGroups((prev) => ({
        ...prev,
        [courseCode]: [...(prev[courseCode] || []), ...newGroups],
      }));

      const nextOffset = offset + PAGE_SIZE;
      setOffsets((prev) => ({ ...prev, [courseCode]: nextOffset }));
      setHasMore((prev) => ({ ...prev, [courseCode]: newGroups.length === PAGE_SIZE }));
    } catch (err) {
      console.error('[Supabase] Unexpected error loading more groups:', err);
      setFetchError('An unexpected error occurred while loading more groups.');
    } finally {
      setIsLoadingMore((prev) => ({ ...prev, [courseCode]: false }));
    }
  }, [offsets, hasMore, isLoadingMore]);

  useEffect(() => {
    if (!enabled || uniqueCourseCodes.length === 0) {
      setAvailableGroups({});
      setFetchError(null);
      setOffsets({});
      setHasMore({});
      setIsLoadingMore({});
      return;
    }

    let channel: ReturnType<typeof supabase.channel> | null = null;
    let isMounted = true;

    const fetchGroups = async () => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      try {
        const { data, error: fetchError } = await supabase
          .from('study_groups')
          .select('id,course_code,course_name,name,description,creator_id,members,created_at')
          .in('course_code', uniqueCourseCodes)
          .order('created_at', { ascending: false })
          .range(0, PAGE_SIZE - 1);

        if (fetchError) {
          console.error('[Supabase] Error fetching study groups:', fetchError);
          if (isMounted) {
            setFetchError('Failed to load study groups. Please try again.');
          }
          return;
        }

        if (!isMounted) return;

        const groups: Record<string, StudyGroup[]> = {};
        (data || []).forEach((row) => {
          const group: StudyGroup = {
            id: row.id,
            courseCode: row.course_code,
            courseName: row.course_name,
            name: row.name,
            description: row.description,
            creatorId: row.creator_id,
            members: row.members || [],
            createdAt: row.created_at,
          };
          if (!groups[group.courseCode]) groups[group.courseCode] = [];
          groups[group.courseCode].push(group);
        });

        setAvailableGroups(groups);
        setFetchError(null);
        setHasMore((prev) => {
          const next = { ...prev };
          uniqueCourseCodes.forEach((code) => {
            next[code] = (groups[code]?.length || 0) === PAGE_SIZE;
          });
          return next;
        });
        setOffsets((prev) => {
          const next = { ...prev };
          uniqueCourseCodes.forEach((code) => {
            next[code] = Math.min(groups[code]?.length || 0, PAGE_SIZE);
          });
          return next;
        });
      } catch (err) {
        console.error('[Supabase] Unexpected error fetching study groups:', err);
        if (isMounted) {
          setFetchError('An unexpected error occurred while loading groups.');
        }
      } finally {
        isFetchingRef.current = false;
      }
    };

    fetchGroups();

    const safeCourseCodes = uniqueCourseCodes.filter((code) => /^[A-Z0-9-]+$/i.test(code));

    if (safeCourseCodes.length > 0) {
      channel = supabase
        .channel(`study_groups_${safeCourseCodes.join(',')}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'study_groups',
            filter: `course_code=in.(${safeCourseCodes.map((c) => `"${c}"`).join(',')})`,
          },
          (payload) => {
            if (!isMounted) return;
            if (payload.eventType === 'INSERT' || payload.eventType === 'DELETE') {
              fetchGroups();
            }
          }
        )
        .subscribe();
    }

    return () => {
      isMounted = false;
      isFetchingRef.current = false;
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [uniqueCourseCodes, enabled, PAGE_SIZE]);

  return { availableGroups, fetchError, hasMore, isLoadingMore, loadMore };
}
