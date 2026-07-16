'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/src/contexts/AuthContext';
import { ADMIN_EXTRACTIONS_STALE_TIME_MS } from '@/src/lib/constants';
import {
  listAllExtractions,
  getExtractionDetails,
  getPlatformStats,
  type AdminExtraction,
} from '../services/adminExtractionService.supabase';

export function useAdminExtractions(page = 1, limit = 50) {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const callerRole = profile?.role || '';

  return useQuery({
    queryKey: ['admin', 'extractions', page, limit],
    queryFn: async (): Promise<AdminExtraction[]> => {
      if (!isAdmin) {
        throw new Error('Unauthorized');
      }
      const result = await listAllExtractions(callerRole, page, limit);
      if (result.error) throw result.error;
      return result.data as AdminExtraction[];
    },
    enabled: isAdmin,
  });
}

export function useAdminExtractionDetail(extractionId: string | null) {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const callerRole = profile?.role || '';

  return useQuery({
    queryKey: ['admin', 'extractions', extractionId],
    queryFn: async () => {
      if (!isAdmin || !extractionId) {
        throw new Error('Unauthorized');
      }
      const result = await getExtractionDetails(extractionId, callerRole);
      if (result.error) throw result.error;
      return result.data;
    },
    enabled: isAdmin && !!extractionId,
  });
}

export function usePlatformStats() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const callerRole = profile?.role || '';

  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      if (!isAdmin) {
        throw new Error('Unauthorized');
      }
      const result = await getPlatformStats(callerRole);
      if (result.error) throw result.error;
      return result.data;
    },
    enabled: isAdmin,
    staleTime: ADMIN_EXTRACTIONS_STALE_TIME_MS,
  });
}

export function useRefreshAdminData() {
  const queryClient = useQueryClient();

  return async () => {
    await queryClient.invalidateQueries({ queryKey: ['admin'] });
  };
}
