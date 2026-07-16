'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/src/contexts/AuthContext';
import {
  createReview,
  listAllReviews,
  listPublicReviews,
  listUserReviews,
  respondToReview,
  getReviewStats,
  type Review,
  type ReviewFilters,
} from '../services/reviewService.supabase';

export function useCreateReview() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const userId = profile?.id || '';

  return useMutation({
    mutationFn: async (input: Parameters<typeof createReview>[1]): Promise<Review> => {
      const result = await createReview(userId, input);
      if (result.error) throw result.error;
      return result.data as Review;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}

export function useAdminReviews(page = 1, limit = 50, filters?: ReviewFilters) {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const callerRole = profile?.role || '';

  return useQuery({
    queryKey: ['admin', 'reviews', page, limit, filters],
    queryFn: async (): Promise<Review[]> => {
      const result = await listAllReviews(callerRole, page, limit, filters);
      if (result.error) throw result.error;
      return result.data as Review[];
    },
    enabled: isAdmin,
  });
}

export function usePublicReviews() {
  return useQuery({
    queryKey: ['reviews', 'public'],
    queryFn: async (): Promise<Review[]> => {
      const result = await listPublicReviews();
      if (result.error) throw result.error;
      return result.data as Review[];
    },
    staleTime: 60_000,
  });
}

export function useUserReviews() {
  const { profile } = useAuth();
  const userId = profile?.id || '';

  return useQuery({
    queryKey: ['reviews', 'user', userId],
    queryFn: async (): Promise<Review[]> => {
      const result = await listUserReviews(userId);
      if (result.error) throw result.error;
      return result.data as Review[];
    },
    enabled: Boolean(userId),
    staleTime: 30_000,
  });
}

export function useRespondToReview() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const callerId = profile?.id || '';
  const callerRole = profile?.role || '';

  return useMutation({
    mutationFn: async (input: Parameters<typeof respondToReview>[2]): Promise<Review> => {
      if (profile?.role !== 'admin') {
        throw new Error('Unauthorized');
      }
      const result = await respondToReview(callerRole, callerId, input);
      if (result.error) throw result.error;
      return result.data as Review;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
    },
  });
}

export function useReviewStats() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const callerRole = profile?.role || '';

  return useQuery({
    queryKey: ['admin', 'reviews', 'stats'],
    queryFn: async (): Promise<{ total: number; pending: number; responded: number; avgRating: number }> => {
      const result = await getReviewStats(callerRole);
      if (result.error) throw result.error;
      return result.data as { total: number; pending: number; responded: number; avgRating: number };
    },
    enabled: isAdmin,
    staleTime: 60_000,
  });
}
