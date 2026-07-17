import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/src/contexts/AuthContext';
import { hasSupabaseEnv } from '@/src/lib/env';
import {
  fetchReferences,
  addReference,
  updateReference,
  removeReference,
  likeReference,
  unlikeReference,
  checkUserLikedReference,
} from '../services/subjects.service';
import type { SubjectReference, SubjectReferenceInsert, SubjectReferenceUpdate } from '../types';

export function useReferences(courseCode: string) {
  const queryClient = useQueryClient();
  const { session, envMissing } = useAuth();

  const { data: references = [], isLoading, error } = useQuery<SubjectReference[]>({
    queryKey: ['subject-references', courseCode],
    queryFn: async () => {
      const result = await fetchReferences(courseCode);
      if (result.error) throw result.error;
      const refs = result.data as SubjectReference[];
      if (session?.user?.id && refs.length > 0) {
        const enriched = await Promise.all(
          refs.map(async (ref) => {
            const likedResult = await checkUserLikedReference(ref.id, session.user!.id);
            return { ...ref, isLiked: likedResult.data || false };
          })
        );
        return enriched;
      }
      return refs;
    },
    enabled: hasSupabaseEnv() && !envMissing && Boolean(courseCode),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });

  const addMutation = useMutation({
    mutationFn: ({ userId, reference }: { userId: string; reference: SubjectReferenceInsert }) =>
      addReference(userId, reference),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subject-references', courseCode] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: SubjectReferenceUpdate }) =>
      updateReference(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subject-references', courseCode] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => removeReference(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subject-references', courseCode] });
    },
  });

  const likeMutation = useMutation({
    mutationFn: ({ referenceId, userId }: { referenceId: string; userId: string }) =>
      likeReference(referenceId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subject-references', courseCode] });
    },
  });

  const unlikeMutation = useMutation({
    mutationFn: ({ referenceId, userId }: { referenceId: string; userId: string }) =>
      unlikeReference(referenceId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subject-references', courseCode] });
    },
  });

  const addReferenceHandler = (reference: SubjectReferenceInsert) => {
    if (!session?.user?.id) return Promise.resolve({ data: null, error: new Error('Not authenticated') });
    return addMutation.mutateAsync({ userId: session.user.id, reference });
  };

  const updateReferenceHandler = (id: string, updates: SubjectReferenceUpdate) => {
    return updateMutation.mutateAsync({ id, updates });
  };

  const removeReferenceHandler = (id: string) => {
    return removeMutation.mutateAsync(id);
  };

  const likeReferenceHandler = (referenceId: string) => {
    if (!session?.user?.id) return;
    return likeMutation.mutateAsync({ referenceId, userId: session.user.id });
  };

  const unlikeReferenceHandler = (referenceId: string) => {
    if (!session?.user?.id) return;
    return unlikeMutation.mutateAsync({ referenceId, userId: session.user.id });
  };

  return {
    references,
    isLoading,
    error: error ? (error as Error).message : null,
    addReference: addReferenceHandler,
    updateReference: updateReferenceHandler,
    removeReference: removeReferenceHandler,
    likeReference: likeReferenceHandler,
    unlikeReference: unlikeReferenceHandler,
    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isRemoving: removeMutation.isPending,
    isLiking: likeMutation.isPending,
    isUnliking: unlikeMutation.isPending,
    canAdd: Boolean(session?.user?.id),
    currentUserId: session?.user?.id,
  };
}
