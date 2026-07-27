'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/src/contexts/AuthContext';
import { ADMIN_EXTRACTIONS_STALE_TIME_MS } from '@/src/lib/constants';
import { getPlatformStats } from '../services/adminExtractionService.supabase';

export function usePlatformStats() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const callerId = profile?.id || '';
  const callerRole = profile?.role || '';

  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      if (!isAdmin) {
        throw new Error('Unauthorized');
      }
      const result = await getPlatformStats(callerId, callerRole);
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
