-- 002m_add_notification_indexes.sql
-- Adds performance indexes for notifications queries

create index if not exists idx_notifications_user_id
  on public.notifications (user_id);

create index if not exists idx_notifications_created_at
  on public.notifications (user_id, created_at desc);
