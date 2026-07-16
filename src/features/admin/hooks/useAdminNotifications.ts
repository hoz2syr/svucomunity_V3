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

export function useAdminNotifications(page = 1, limit = 50, filters?: { type?: string; priority?: string; read?: boolean; search?: string }) {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const callerRole = profile?.role || '';

  return useQuery({
    queryKey: ['admin', 'notifications', page, limit, filters],
    queryFn: async (): Promise<AdminNotification[]> => {
      if (!isAdmin) {
        throw new Error('Unauthorized');
      }
      const result = await listAllNotifications(callerRole, page, limit, filters);
      if (result.error) throw result.error;
      return result.data as AdminNotification[];
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
      const result = await createAdminNotification(callerRole, callerId, input);
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
      const result = await broadcastToAllUsers(callerRole, callerId, input);
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
  const callerRole = profile?.role || '';

  return useMutation({
    mutationFn: async (notificationId: string): Promise<null> => {
      if (profile?.role !== 'admin') {
        throw new Error('Unauthorized');
      }
      const result = await deleteAnyNotificationAdmin(callerRole, notificationId);
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
  const callerRole = profile?.role || '';

  return useMutation({
    mutationFn: async (notificationId: string): Promise<AdminNotification> => {
      if (profile?.role !== 'admin') {
        throw new Error('Unauthorized');
      }
      const result = await markNotificationAsReadAdmin(callerRole, notificationId);
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
  const callerRole = profile?.role || '';

  return useQuery({
    queryKey: ['admin', 'notifications', 'stats'],
    queryFn: async (): Promise<{ total: number; unread: number; broadcasts: number; userNotifications: number }> => {
      if (!isAdmin) {
        throw new Error('Unauthorized');
      }
      const result = await getNotificationStats(callerRole);
      if (result.error) throw result.error;
      return result.data as { total: number; unread: number; broadcasts: number; userNotifications: number };
    },
    enabled: isAdmin,
    staleTime: 30_000,
  });
}
