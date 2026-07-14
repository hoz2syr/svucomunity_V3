import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/src/contexts/AuthContext';
import { hasSupabaseEnv } from '@/src/lib/env';
import { addReference, removeReference, fetchReferences } from '../services/subjects.service';
import type { SubjectReference, SubjectReferenceInsert } from '../types';

export function useReferences(courseCode: string) {
  const queryClient = useQueryClient();
  const { session, envMissing } = useAuth();

  const { data: references = [], isLoading, error } = useQuery<SubjectReference[]>({
    queryKey: ['subject-references', courseCode],
    queryFn: () => fetchReferences(courseCode).then((result) => {
      if (result.error) throw result.error;
      return result.data as SubjectReference[];
    }),
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

  const removeMutation = useMutation({
    mutationFn: (id: string) => removeReference(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subject-references', courseCode] });
    },
  });

  const addReferenceHandler = (reference: SubjectReferenceInsert) => {
    if (!session?.user?.id) return;
    return addMutation.mutateAsync({ userId: session.user.id, reference });
  };

  const removeReferenceHandler = (id: string) => {
    return removeMutation.mutateAsync(id);
  };

  return {
    references,
    isLoading,
    error: error ? (error as Error).message : null,
    addReference: addReferenceHandler,
    removeReference: removeReferenceHandler,
    isAdding: addMutation.isPending,
    isRemoving: removeMutation.isPending,
    canAdd: Boolean(session?.user?.id),
  };
}
