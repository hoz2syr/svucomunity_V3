-- Example seed data for local development
-- Run with: supabase db seed

insert into public.notifications (user_id, title, body, read)
values
  (
    '00000000-0000-0000-0000-000000000001',
    'مرحباً بك في SVU Community',
    'تم تفعيل حسابك بنجاح. يمكنك الآن استكشاف المنصة.',
    false
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'تذكير: موعد التسجيل',
    'يرجى مراجعة موعد تسجيل المواد لهذا الفصل.',
    false
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'تم تحديث الجدول الدراسي',
    'تم تعديل جدول المحاضرات يرجى المراجعة.',
    true
  );
