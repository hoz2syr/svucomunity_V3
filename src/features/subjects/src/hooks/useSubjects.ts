import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/src/contexts/AuthContext';
import { hasSupabaseEnv } from '@/src/lib/env';
import {
  getAllSubjects,
  getSubjectByCode,
  filterSubjectsByMajor,
  fetchReferences,
} from '../services/subjects.service';
import type { SubjectReference } from '../types';

export function useSubjects() {
  const { profile } = useAuth();

  const subjects = useMemo(() => getAllSubjects(), []);

  const filteredSubjects = useMemo(() => {
    return filterSubjectsByMajor(subjects, profile?.major);
  }, [subjects, profile?.major]);

  return {
    subjects: filteredSubjects,
    allSubjects: subjects,
    major: profile?.major,
  };
}

export function useSubjectDetail(courseCode: string) {
  const { envMissing } = useAuth();
  const subject = useMemo(() => getSubjectByCode(courseCode), [courseCode]);

  const { data: references, isLoading: referencesLoading, error: referencesError } = useQuery<SubjectReference[]>({
    queryKey: ['subject-references', courseCode],
    queryFn: () => fetchReferences(courseCode).then((result) => {
      if (result.error) throw result.error;
      return result.data as SubjectReference[];
    }),
    enabled: hasSupabaseEnv() && !envMissing && Boolean(courseCode),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });

  return {
    subject,
    references: references || [],
    referencesLoading,
    referencesError: referencesError ? (referencesError as Error).message : null,
  };
}
