'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/src/contexts/AuthContext';
import {
  listAllNotifications,
  createAdminNotification,
  broadcastToAllUsers,
  deleteAnyNotificationAdmin,
  markNotificationAsReadAdmin,
  getNotificationStats,
  type AdminNotification,
} from '../services/adminNotificationService.supabase';
import { ADMIN_NOTIFICATION_PAGE_LIMIT } from '@/src/lib/constants';

export function useAdminNotifications(page = 1, limit = ADMIN_NOTIFICATION_PAGE_LIMIT, filters?: { type?: string; priority?: string; read?: boolean; search?: string }) {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const callerId = profile?.id || '';
  const callerRole = profile?.role || '';

  return useQuery({
    queryKey: ['admin', 'notifications', page, limit, filters],
    queryFn: async (): Promise<{ items: AdminNotification[]; totalCount: number }> => {
      if (!isAdmin) {
        throw new Error('Unauthorized');
      }
      const result = await listAllNotifications(callerId, callerRole, page, limit, filters);
      if (result.error) throw result.error;
      return { items: result.data as AdminNotification[], totalCount: result.totalCount };
    },
    enabled: isAdmin,
  });
}

export function useCreateAdminNotification() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const callerId = profile?.id || '';
  const callerRole = profile?.role || '';

  return useMutation({
    mutationFn: async (input: Parameters<typeof createAdminNotification>[2]): Promise<AdminNotification> => {
      if (profile?.role !== 'admin') {
        throw new Error('Unauthorized');
      }
      const result = await createAdminNotification(callerId, callerRole, input);
      if (result.error) throw result.error;
      return result.data as AdminNotification;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] });
    },
  });
}

export function useBroadcastNotification() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const callerId = profile?.id || '';
  const callerRole = profile?.role || '';

  return useMutation({
    mutationFn: async (input: Parameters<typeof broadcastToAllUsers>[2]): Promise<AdminNotification[]> => {
      if (profile?.role !== 'admin') {
        throw new Error('Unauthorized');
      }
      const result = await broadcastToAllUsers(callerId, callerRole, input);
      if (result.error) throw result.error;
      return result.data as AdminNotification[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] });
    },
  });
}

export function useDeleteAdminNotification() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const callerId = profile?.id || '';
  const callerRole = profile?.role || '';

  return useMutation({
    mutationFn: async (notificationId: string): Promise<null> => {
      if (profile?.role !== 'admin') {
        throw new Error('Unauthorized');
      }
      const result = await deleteAnyNotificationAdmin(callerId, callerRole, notificationId);
      if (result.error) throw result.error;
      return result.data as null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] });
    },
  });
}

export function useMarkNotificationAsReadAdmin() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const callerId = profile?.id || '';
  const callerRole = profile?.role || '';

  return useMutation({
    mutationFn: async (notificationId: string): Promise<AdminNotification> => {
      if (profile?.role !== 'admin') {
        throw new Error('Unauthorized');
      }
      const result = await markNotificationAsReadAdmin(callerId, callerRole, notificationId);
      if (result.error) throw result.error;
      return result.data as AdminNotification;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] });
    },
  });
}

export function useNotificationStats() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const callerId = profile?.id || '';
  const callerRole = profile?.role || '';

  return useQuery({
    queryKey: ['admin', 'notifications', 'stats'],
    queryFn: async (): Promise<{ total: number; unread: number; broadcasts: number; userNotifications: number }> => {
      if (!isAdmin) {
        throw new Error('Unauthorized');
      }
      const result = await getNotificationStats(callerId, callerRole);
      if (result.error) throw result.error;
      return result.data as { total: number; unread: number; broadcasts: number; userNotifications: number };
    },
    enabled: isAdmin,
    staleTime: 30_000,
  });
}
