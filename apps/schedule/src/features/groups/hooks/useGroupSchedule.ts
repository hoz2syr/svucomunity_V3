import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@svu-community/supabase-client';
import type { StudyGroup } from '../../../services/types';

interface GroupRow {
  id: string;
  name: string;
  description: string | null;
  members: string[];
  created_at: string;
  course_code: string;
  course_name: string;
  creator_id: string;
}

const PAGE_SIZE = 30;

const toStudyGroup = (row: GroupRow): StudyGroup => ({
  id: row.id,
  courseCode: row.course_code,
  courseName: row.course_name,
  name: row.name,
  description: row.description ?? undefined,
  creatorId: row.creator_id,
  members: row.members,
  createdAt: row.created_at,
});

interface UseGroupScheduleReturn {
  groups: StudyGroup[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  isLoadingMore: boolean;
  loadMore: () => Promise<void>;
}

export function useStudyGroups(): UseGroupScheduleReturn {
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchGroups = useCallback(async (currentOffset: number, pageSize: number, isLoadMore = false) => {
    const run = async () => {
      if (!isLoadMore) {
        setLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('groups')
          .select('id,name,description,members,created_at,course_code,course_name,creator_id')
          .order('created_at', { ascending: false })
          .range(currentOffset, currentOffset + pageSize - 1);

        if (fetchError) throw fetchError;

        const rows = (data as GroupRow[] | null) || [];
        const normalized = rows.map(toStudyGroup);

        setGroups((prev) => (isLoadMore ? [...prev, ...normalized] : normalized));
        setHasMore(normalized.length === pageSize);

        if (isLoadMore) {
          setOffset(currentOffset + pageSize);
        } else {
          setOffset(Math.min(pageSize, normalized.length));
        }

        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error loading groups');
      } finally {
        if (!isLoadMore) {
          setLoading(false);
        } else {
          setIsLoadingMore(false);
        }
      }
    };

    await run();
  }, []);

  useEffect(() => {
    fetchGroups(0, PAGE_SIZE);

    return () => {
      setGroups([]);
      setError(null);
    };
  }, [fetchGroups]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    await fetchGroups(offset, PAGE_SIZE, true);
  }, [fetchGroups, offset, isLoadingMore, hasMore]);

  return { groups, loading, error, hasMore, isLoadingMore, loadMore };
}
