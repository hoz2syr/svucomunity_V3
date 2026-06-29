import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchNotifications, markAllRead, markAsRead, deleteNotification } from '../../services/notification.service';
import { missingSupabaseEnvMessage } from '../../services/environment.service';
import { useGuest } from '../../contexts/GuestContext';
import { useAuth } from '../../contexts/AuthContext';
import type { Notification } from '../../types/notification';

export const useDashboardNotifications = () => {
  const { isGuest } = useGuest();
  const { session } = useAuth();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();

  const { data = [], isLoading, error } = useQuery({
    queryKey: ['notifications', userId],
    queryFn: async (): Promise<Notification[]> => {
      const result = await fetchNotifications();
      if (result.error) {
        const message = result.error.message === missingSupabaseEnvMessage ? missingSupabaseEnvMessage : result.error.message;
        throw new Error(message);
      }
      return result.data;
    },
    enabled: !isGuest && Boolean(userId),
    staleTime: 1000 * 60,
  });

  const markAsReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      if (userId) queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllRead,
    onSuccess: () => {
      if (userId) queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      if (userId) queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    },
  });

  const handleMarkAsRead = (id: string) => markAsReadMutation.mutateAsync(id);
  const handleMarkAllRead = () => {
    if (userId) markAllReadMutation.mutateAsync(userId);
  };
  const handleDeleteNotification = (id: string) => deleteNotificationMutation.mutateAsync(id);

  if (isGuest) {
    return {
      notifications: [] as Notification[],
      notificationsLoading: false,
      notificationsError: null,
      handleMarkAsRead: async () => {},
      handleMarkAllRead: async () => {},
      handleDeleteNotification: async () => {},
    };
  }

  return {
    notifications: data,
    notificationsLoading: isLoading,
    notificationsError: error instanceof Error ? error.message : null,
    handleMarkAsRead,
    handleMarkAllRead,
    handleDeleteNotification,
  };
};
