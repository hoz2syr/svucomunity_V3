'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/src/contexts/AuthContext';
import {
  listAllUsers,
  updateUserRole,
  getUserRoleCounts,
  type AdminUser,
} from '../services/adminUserService.supabase';
import { ADMIN_USER_PAGE_LIMIT } from '@/src/lib/constants';

export function useAdminUsers(page = 1, limit = ADMIN_USER_PAGE_LIMIT) {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const callerId = profile?.id || '';
  const callerRole = profile?.role || '';

  return useQuery({
    queryKey: ['admin', 'users', page, limit],
    queryFn: async (): Promise<{ items: AdminUser[]; totalCount: number }> => {
      if (!isAdmin) {
        throw new Error('Unauthorized');
      }
      const result = await listAllUsers(callerId, callerRole, page, limit);
      if (result.error) throw result.error;
      return { items: result.data as AdminUser[], totalCount: result.totalCount };
    },
    enabled: isAdmin,
  });
}

export function useAdminUserRoleCounts() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const callerId = profile?.id || '';
  const callerRole = profile?.role || '';

  return useQuery({
    queryKey: ['admin', 'users', 'role-counts'],
    queryFn: async () => {
      const result = await getUserRoleCounts(callerId, callerRole);
      if (result.error) throw result.error;
      return result.data as { admin: number; user: number; student: number };
    },
    enabled: isAdmin,
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const callerId = profile?.id || '';
  const callerRole = profile?.role || '';

  return useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: string }): Promise<AdminUser> => {
      if (profile?.role !== 'admin') {
        throw new Error('Unauthorized');
      }
      const result = await updateUserRole(userId, newRole, callerId, callerRole);
      if (result.error) throw result.error;
      return result.data as AdminUser;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', 'role-counts'] });
    },
  });
}
