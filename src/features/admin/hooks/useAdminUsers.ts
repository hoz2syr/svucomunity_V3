'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/src/contexts/AuthContext';
import { listAllUsers, updateUserRole, type AdminUser } from '../services/adminUserService.supabase';

export function useAdminUsers() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const callerRole = profile?.role || '';

  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async (): Promise<AdminUser[]> => {
      if (!isAdmin) {
        throw new Error('Unauthorized');
      }
      const result = await listAllUsers(callerRole);
      if (result.error) throw result.error;
      return result.data as AdminUser[];
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
    },
  });
}
