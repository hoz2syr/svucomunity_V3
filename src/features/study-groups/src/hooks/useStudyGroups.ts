"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { StudyGroup, StudyGroupFilters, StudyGroupStatus, Course } from '../types';
import { studyGroupService, getCreators } from '../core/services';
import { useDebounce } from './useDebounce';

export interface StudyGroupEnriched extends StudyGroup {
  _creatorFullName: string;
  _creatorUsername: string;
}

const INITIAL_FILTERS: StudyGroupFilters = {
  search: '',
  major: '',
  course_code: '',
  class_number: '',
  status: 'all',
};

export function useStudyGroups(userId: string | undefined) {
  const [groups, setGroups] = useState<StudyGroupEnriched[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<StudyGroupFilters>(INITIAL_FILTERS);
  const [courses, setCourses] = useState<Course[]>([]);

  const loadCourses = useCallback(async (major: string) => {
    if (!major) {
      setCourses([]);
      return;
    }
    try {
      const data = await studyGroupService.getCoursesByMajor(major);
      setCourses(data);
    } catch {
      setCourses([]);
    }
  }, []);

  const loadGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await studyGroupService.getAllWithCreators();

      if (!data || data.length === 0) {
        setGroups([]);
        setLoading(false);
        return;
      }

      const creatorIds = [...new Set(data.map((g: StudyGroup) => g.creator_id).filter(Boolean))] as string[];
      const creators = creatorIds.length > 0
        ? await getCreators(creatorIds)
        : {};

      const enriched: StudyGroupEnriched[] = data.map((group: StudyGroup) => {
        const creator = creators[group.creator_id];
        return {
          ...group,
          _creatorFullName: creator
            ? `${creator.first_name || ''} ${creator.last_name || ''}`.trim() || group.creator_name
            : group.creator_name || 'غير معروف',
          _creatorUsername: creator?.username || '',
        };
      });

      setGroups(enriched);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل تحميل المجموعات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      loadGroups();
    }
  }, [userId, loadGroups]);

  useEffect(() => {
    loadCourses(filters.major);
  }, [filters.major, loadCourses]);

  const updateFilter = useCallback(<K extends keyof StudyGroupFilters>(
    key: K,
    value: StudyGroupFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
  }, []);

  const onSearchChange = useDebounce((value: string) => {
    updateFilter('search', value);
  }, 300);

  const filteredGroups = useMemo(() => {
    return groups.filter(group => {
      const search = filters.search.toLowerCase();
      if (search) {
        const haystack = `${group.name} ${group.course_name} ${group.course_code} ${group.major} ${group._creatorFullName || ''}`.toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      if (filters.major && group.major !== filters.major) return false;
      if (filters.course_code && group.course_code !== filters.course_code) return false;
      if (filters.class_number && group.class_number !== filters.class_number) return false;
      if (filters.status === 'available' && group.current_members >= group.max_members) return false;
      if (filters.status === 'full' && group.current_members < group.max_members) return false;
      return true;
    });
  }, [groups, filters]);

  const status = useMemo<StudyGroupStatus>(() => {
    if (loading) return 'loading';
    if (error) return 'error';
    if (filteredGroups.length === 0) return 'empty';
    return 'success';
  }, [loading, error, filteredGroups.length]);

  return {
    groups: filteredGroups,
    allGroups: groups,
    loading,
    error,
    filters,
    courses,
    status,
    updateFilter,
    clearFilters,
    onSearchChange: onSearchChange.debouncedFn,
    reload: loadGroups,
  };
}
