import { useQuery } from '@tanstack/react-query';
import { fetchNotifications } from '../../services/notification.service';
import { missingSupabaseEnvMessage } from '../../services/environment.service';
import { useGuest } from '../../contexts/GuestContext';
import { useAuth } from '../../contexts/AuthContext';
import type { Notification } from '../../types/notification';

export const useDashboardNotifications = () => {
  const { isGuest } = useGuest();
  const { session } = useAuth();
  const userId = session?.user?.id;

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
    enabled: !isGuest,
    staleTime: 1000 * 60,
  });

  if (isGuest) {
    return {
      notifications: [] as Notification[],
      notificationsLoading: false,
      notificationsError: null,
    };
  }

  return {
    notifications: data,
    notificationsLoading: isLoading,
    notificationsError: error instanceof Error ? error.message : null,
  };
};
