-- Example seed data for local development
-- Run with: supabase db seed

insert into public.profiles (id, full_name, avatar_url, phone)
values
  (
    '00000000-0000-0000-0000-000000000001',
    'طالب تجريبي',
    null,
    '0500000000'
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'مستخدم ثاني',
    null,
    '0500000001'
  );
