'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/src/contexts/AuthContext';
import {
  listAllExtractions,
  getExtractionDetails,
  type AdminExtraction,
} from '../services/adminExtractionService.supabase';

export function useAdminExtractions(page = 1, limit = 50) {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const callerId = profile?.id || '';
  const callerRole = profile?.role || '';

  return useQuery({
    queryKey: ['admin', 'extractions', page, limit],
    queryFn: async (): Promise<{ items: AdminExtraction[]; totalCount: number }> => {
      if (!isAdmin) {
        throw new Error('Unauthorized');
      }
      const result = await listAllExtractions(callerId, callerRole, page, limit);
      if (result.error) throw result.error;
      return { items: result.data as AdminExtraction[], totalCount: result.totalCount };
    },
    enabled: isAdmin && callerRole !== '',
  });
}

export function useAdminExtractionDetail(extractionId: string | null) {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const callerId = profile?.id || '';
  const callerRole = profile?.role || '';

  return useQuery({
    queryKey: ['admin', 'extractions', extractionId],
    queryFn: async () => {
      if (!isAdmin || !extractionId) {
        throw new Error('Unauthorized');
      }
      const result = await getExtractionDetails(extractionId, callerId, callerRole);
      if (result.error) throw result.error;
      return result.data;
    },
    enabled: isAdmin && !!extractionId && callerRole !== '',
  });
}
