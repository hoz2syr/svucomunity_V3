import { useEffect, useState } from 'react';
import { fetchNotifications } from '../../services/notification.service';
import { getErrorMessage } from '../../services/environment.service';
import { missingSupabaseEnvMessage } from '../../services/environment.service';
import { useGuest } from '../../contexts/GuestContext';
import type { Notification } from '../../types/notification';

export const useDashboardNotifications = () => {
  const { isGuest } = useGuest();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [notificationsError, setNotificationsError] = useState<string | null>(null);

  useEffect(() => {
    if (isGuest) {
      setNotifications([]);
      setNotificationsLoading(false);
      setNotificationsError(null);
      return;
    }

    let cancelled = false;

    const loadNotifications = async () => {
      setNotificationsLoading(true);
      setNotificationsError(null);

      const result = await fetchNotifications();

      if (cancelled) return;

      if (result.error) {
        setNotificationsError(result.error.message === missingSupabaseEnvMessage ? missingSupabaseEnvMessage : result.error.message);
        setNotifications([]);
        setNotificationsLoading(false);
        return;
      }

      setNotifications(result.data);
      setNotificationsLoading(false);
    };

    loadNotifications();

    return () => {
      cancelled = true;
    };
  }, [isGuest]);

  return {
    notifications,
    notificationsLoading,
    notificationsError,
  };
};
