'use client';
import { useQuery, queryOptions } from '@tanstack/react-query';
import { loadDiscoveredInstructors, type ServiceResult } from '../services/extractionService.supabase';
import type { DiscoveredInstructor } from '@/src/types/database';

export const discoveredInstructorsQueryOptions = () =>
  queryOptions({
    queryKey: ['schedule-extraction', 'discovered-instructors'],
    queryFn: async () => {
      const result: ServiceResult<DiscoveredInstructor[]> = await loadDiscoveredInstructors();
      if (result.error) throw result.error;
      return result.data as DiscoveredInstructor[];
    },
  });

export function useDiscoveredInstructors() {
  return useQuery(discoveredInstructorsQueryOptions());
}
