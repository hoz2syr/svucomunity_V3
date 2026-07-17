import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/src/contexts/AuthContext';
import { hasSupabaseEnv } from '@/src/lib/env';
import { fetchUserReferences, updateReference, removeReference } from '../services/subjects.service';
import type { SubjectReference, SubjectReferenceUpdate } from '../types';

export function useUserReferences() {
  const queryClient = useQueryClient();
  const { session, envMissing } = useAuth();
  const userId = session?.user?.id;

  const { data: references = [], isLoading, error, refetch } = useQuery<SubjectReference[]>({
    queryKey: ['user-references', userId],
    queryFn: () => fetchUserReferences(userId!).then((result) => {
      if (result.error) throw result.error;
      return result.data as SubjectReference[];
    }),
    enabled: hasSupabaseEnv() && !envMissing && Boolean(userId),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: SubjectReferenceUpdate }) =>
      updateReference(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-references', userId] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => removeReference(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-references', userId] });
    },
  });

  const updateReferenceHandler = (id: string, updates: SubjectReferenceUpdate) => {
    return updateMutation.mutateAsync({ id, updates });
  };

  const removeReferenceHandler = (id: string) => {
    return removeMutation.mutateAsync(id);
  };

  return {
    references,
    isLoading,
    error: error ? (error as Error).message : null,
    updateReference: updateReferenceHandler,
    removeReference: removeReferenceHandler,
    refetch,
    isUpdating: updateMutation.isPending,
    isRemoving: removeMutation.isPending,
  };
}
