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
    updateReference,
    removeReference,
    likeReference,
    unlikeReference,
    isAdding,
    isUpdating,
    isRemoving,
    isLiking,
    isUnliking,
    canAdd,
    currentUserId,
  } = useReferences(courseCode);

  return {
    subject,
    references: references as SubjectReference[],
    referencesLoading,
    referencesError: referencesError || null,
    addReference,
    updateReference,
    removeReference,
    likeReference,
    unlikeReference,
    isAdding,
    isUpdating,
    isRemoving,
    isLiking,
    isUnliking,
    canAdd,
    currentUserId,
  };
}
