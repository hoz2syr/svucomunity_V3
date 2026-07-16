import { QueryClient, keepPreviousData } from '@tanstack/react-query';
import { QUERY_STALE_TIME_MS, QUERY_GC_TIME_MS } from './constants';

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
        staleTime: QUERY_STALE_TIME_MS,
        gcTime: QUERY_GC_TIME_MS,
        placeholderData: keepPreviousData,
      },
    },
  });
