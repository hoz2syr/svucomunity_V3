import { useMemo } from 'react';
import { getSubjectByCode } from '../services/subjects.service';
import { useReferences } from './useReferences';
import type { SubjectReference } from '../types';

export function useSubjectDetail(courseCode: string) {
  const subject = useMemo(() => getSubjectByCode(courseCode), [courseCode]);

  const {
    references,
    isLoading: referencesLoading,
    error: referencesError,
    addReference,
    removeReference,
    isAdding,
    isRemoving,
    canAdd,
  } = useReferences(courseCode);

  return {
    subject,
    references: references as SubjectReference[],
    referencesLoading,
    referencesError: referencesError || null,
    addReference,
    removeReference,
    isAdding,
    isRemoving,
    canAdd,
  };
}
