export type NotificationType = 'user' | 'admin_broadcast' | 'system';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  body: string;
  read: boolean;
  type: NotificationType;
  created_by: string | null;
  priority: NotificationPriority;
  createdAt: string;
};

export type CreateNotificationInput = {
  user_id: string;
  title: string;
  body: string;
  type?: NotificationType;
  priority?: NotificationPriority;
};

export type BroadcastNotificationInput = {
  title: string;
  body: string;
  priority?: NotificationPriority;
  target_user_ids?: string[];
};
