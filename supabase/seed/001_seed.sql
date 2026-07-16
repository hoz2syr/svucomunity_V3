-- ============================================================
-- SVU Community — Comprehensive Seed Data
-- ============================================================
-- This script seeds the local Supabase database with realistic
-- test data for all features: exams, study groups, courses,
-- subjects, notifications, admin logs, and extractions.
--
-- How to run:
--   1. Start Supabase: supabase start
--   2. Apply migrations: supabase db reset
--   3. Run seed: supabase db execute --file supabase/seed/001_seed.sql
--
-- Or paste into Supabase Dashboard → SQL Editor.
-- ============================================================

-- ============================================================
-- 0. Helpers
-- ============================================================

-- Simple UUID generator for seed data
-- We use gen_random_uuid() from pgcrypto (bundled with Supabase)

-- ============================================================
-- 1. AUTH USERS (prerequisite for all FK tables)
-- ============================================================
-- We insert directly into auth.users using service_role privileges.
-- Passwords are hashed with bcrypt for testing purposes.
-- Default password for all test accounts: "password123"

DO $$
DECLARE
  -- Test users with deterministic UUIDs for reproducibility
  admin_user_id uuid := '11111111-1111-1111-1111-111111111111';
  student1_id   uuid := '22222222-2222-2222-2222-222222222222';
  student2_id   uuid := '33333333-3333-3333-3333-333333333333';
  student3_id   uuid := '44444444-4444-4444-4444-444444444444';
  student4_id   uuid := '55555555-5555-5555-5555-555555555555';
  student5_id   uuid := '66666666-6666-6666-6666-666666666666';
  student6_id   uuid := '77777777-7777-7777-7777-777777777777';
  student7_id   uuid := '88888888-8888-8888-8888-888888888888';
  student8_id   uuid := '99999999-9999-9999-9999-999999999999';
  student9_id   uuid := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  student10_id  uuid := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
BEGIN
  -- Insert users into auth.users
  -- Note: email_confirmed_at is set so they can log in immediately
  INSERT INTO auth.users (
    id, email, encrypted_password, email_confirmed_at,
    confirmation_token, confirmation_sent_at,
    recovery_token, recovery_sent_at,
    last_sign_in_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data,
    is_super_admin, phone, phone_confirmed_at,
    email_confirmed, last_sign_in_ip, signup_ip,
    banned_until
  ) VALUES
  (
    admin_user_id,
    'admin@svu.edu',
    crypt('password123', gen_salt('bf', 10)),
    now(), NULL, NULL, NULL, NULL, now(), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Dr. Ahmed Admin","role":"admin"}'::jsonb,
    false, NULL, NULL, true, '127.0.0.1', '127.0.0.1', NULL
  ),
  (
    student1_id,
    'ahmed@svu.edu',
    crypt('password123', gen_salt('bf', 10)),
    now(), NULL, NULL, NULL, NULL, now(), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Ahmed Mohamed"}'::jsonb,
    false, NULL, NULL, true, '127.0.0.1', '127.0.0.1', NULL
  ),
  (
    student2_id,
    'sara@svu.edu',
    crypt('password123', gen_salt('bf', 10)),
    now(), NULL, NULL, NULL, NULL, now(), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Sara Ali"}'::jsonb,
    false, NULL, NULL, true, '127.0.0.1', '127.0.0.1', NULL
  ),
  (
    student3_id,
    'omar@svu.edu',
    crypt('password123', gen_salt('bf', 10)),
    now(), NULL, NULL, NULL, NULL, now(), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Omar Hassan"}'::jsonb,
    false, NULL, NULL, true, '127.0.0.1', '127.0.0.1', NULL
  ),
  (
    student4_id,
    'nour@svu.edu',
    crypt('password123', gen_salt('bf', 10)),
    now(), NULL, NULL, NULL, NULL, now(), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Nour Khaled"}'::jsonb,
    false, NULL, NULL, true, '127.0.0.1', '127.0.0.1', NULL
  ),
  (
    student5_id,
    'youssef@svu.edu',
    crypt('password123', gen_salt('bf', 10)),
    now(), NULL, NULL, NULL, NULL, now(), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Youssef Ibrahim"}'::jsonb,
    false, NULL, NULL, true, '127.0.0.1', '127.0.0.1', NULL
  ),
  (
    student6_id,
    'layla@svu.edu',
    crypt('password123', gen_salt('bf', 10)),
    now(), NULL, NULL, NULL, NULL, now(), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Layla Mahmoud"}'::jsonb,
    false, NULL, NULL, true, '127.0.0.1', '127.0.0.1', NULL
  ),
  (
    student7_id,
    'khaled@svu.edu',
    crypt('password123', gen_salt('bf', 10)),
    now(), NULL, NULL, NULL, NULL, now(), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Khaled Farid"}'::jsonb,
    false, NULL, NULL, true, '127.0.0.1', '127.0.0.1', NULL
  ),
  (
    student8_id,
    'mariam@svu.edu',
    crypt('password123', gen_salt('bf', 10)),
    now(), NULL, NULL, NULL, NULL, now(), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Mariam Tariq"}'::jsonb,
    false, NULL, NULL, true, '127.0.0.1', '127.0.0.1', NULL
  ),
  (
    student9_id,
    'hassan@svu.edu',
    crypt('password123', gen_salt('bf', 10)),
    now(), NULL, NULL, NULL, NULL, now(), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Hassan Nabil"}'::jsonb,
    false, NULL, NULL, true, '127.0.0.1', '127.0.0.1', NULL
  ),
  (
    student10_id,
    'dina@svu.edu',
    crypt('password123', gen_salt('bf', 10)),
    now(), NULL, NULL, NULL, NULL, now(), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Dina Samir"}'::jsonb,
    false, NULL, NULL, true, '127.0.0.1', '127.0.0.1', NULL
  )
  ON CONFLICT (id) DO NOTHING;
END $$;

-- ============================================================
-- 2. PROFILES
-- ============================================================
-- Temporarily disable the role change prevention trigger
-- to allow seeding admin role.
DROP TRIGGER IF EXISTS prevent_role_change ON public.profiles;

INSERT INTO public.profiles (
  id, full_name, avatar_url, phone, email, username,
  role, provider, provider_id, major, current_semester,
  created_at, updated_at
) VALUES
(
  '11111111-1111-1111-1111-111111111111',
  'Dr. Ahmed Admin',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
  '+201000000001',
  'admin@svu.edu',
  'admin_ahmed',
  'admin', 'email', NULL,
  'Computer Science', '2026-2',
  now() - interval '60 days', now()
),
(
  '22222222-2222-2222-2222-222222222222',
  'Ahmed Mohamed',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=ahmed',
  '+201000000002',
  'ahmed@svu.edu',
  'ahmed_m',
  'student', 'email', NULL,
  'Computer Science', '2026-2',
  now() - interval '50 days', now()
),
(
  '33333333-3333-3333-3333-333333333333',
  'Sara Ali',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=sara',
  '+201000000003',
  'sara@svu.edu',
  'sara_a',
  'student', 'email', NULL,
  'Information Systems', '2026-1',
  now() - interval '45 days', now()
),
(
  '44444444-4444-4444-4444-444444444444',
  'Omar Hassan',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=omar',
  '+201000000004',
  'omar@svu.edu',
  'omar_h',
  'student', 'email', NULL,
  'Computer Science', '2025-2',
  now() - interval '40 days', now()
),
(
  '55555555-5555-5555-5555-555555555555',
  'Nour Khaled',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=nour',
  '+201000000005',
  'nour@svu.edu',
  'nour_k',
  'student', 'email', NULL,
  'Computer Science', '2026-1',
  now() - interval '35 days', now()
),
(
  '66666666-6666-6666-6666-666666666666',
  'Youssef Ibrahim',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=youssef',
  '+201000000006',
  'youssef@svu.edu',
  'youssef_i',
  'student', 'email', NULL,
  'Information Systems', '2025-1',
  now() - interval '30 days', now()
),
(
  '77777777-7777-7777-7777-777777777777',
  'Layla Mahmoud',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=layla',
  '+201000000007',
  'layla@svu.edu',
  'layla_m',
  'student', 'email', NULL,
  'Computer Science', '2026-2',
  now() - interval '25 days', now()
),
(
  '88888888-8888-8888-8888-888888888888',
  'Khaled Farid',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=khaled',
  '+201000000008',
  'khaled@svu.edu',
  'khaled_f',
  'student', 'email', NULL,
  'Information Systems', '2026-2',
  now() - interval '20 days', now()
),
(
  '99999999-9999-9999-9999-999999999999',
  'Mariam Tariq',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=mariam',
  '+201000000009',
  'mariam@svu.edu',
  'mariam_t',
  'student', 'email', NULL,
  'Computer Science', '2025-2',
  now() - interval '15 days', now()
),
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'Hassan Nabil',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=hassan',
  '+201000000010',
  'hassan@svu.edu',
  'hassan_n',
  'student', 'email', NULL,
  'Computer Science', '2026-1',
  now() - interval '10 days', now()
),
(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'Dina Samir',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=dina',
  '+201000000011',
  'dina@svu.edu',
  'dina_s',
  'student', 'email', NULL,
  'Information Systems', '2026-1',
  now() - interval '5 days', now()
)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  username = EXCLUDED.username,
  role = EXCLUDED.role,
  major = EXCLUDED.major,
  current_semester = EXCLUDED.current_semester,
  updated_at = now();

-- Restore the role change prevention trigger
CREATE OR REPLACE FUNCTION public.prevent_role_change()
RETURNS trigger AS $$
BEGIN
  IF old.role IS DISTINCT FROM new.role
     AND auth.uid() IS NULL
  THEN
    RAISE EXCEPTION 'Role changes are only allowed via admin actions';
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_role_change
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_change();

-- ============================================================
-- 3. DISCOVERED MAJORS (prerequisite for courses/subjects)
-- ============================================================
INSERT INTO public.discovered_majors (major_code, major_name_ar, major_name_en, seen_count, first_seen_at, last_seen_at)
VALUES
  ('CS', 'علوم الحاسب', 'Computer Science', 15, now() - interval '90 days', now()),
  ('IS', 'نظم المعلومات', 'Information Systems', 12, now() - interval '85 days', now()),
  ('IT', 'تكنولوجيا المعلومات', 'Information Technology', 8, now() - interval '80 days', now()),
  ('AI', 'الذكاء الاصطناعي', 'Artificial Intelligence', 6, now() - interval '70 days', now()),
  ('DS', 'علم البيانات', 'Data Science', 5, now() - interval '60 days', now())
ON CONFLICT (major_code) DO UPDATE SET
  major_name_ar = EXCLUDED.major_name_ar,
  major_name_en = EXCLUDED.major_name_en,
  last_seen_at = now();

-- ============================================================
-- 4. DISCOVERED INSTRUCTORS
-- ============================================================
INSERT INTO public.discovered_instructors (instructor_username, full_name, seen_count, first_seen_at, last_seen_at, is_verified, verified_at, verified_by)
VALUES
  ('dr_mahmoud', 'د. Mahmoud Abdel Rahman', 20, now() - interval '90 days', now(), true, now(), '11111111-1111-1111-1111-111111111111'),
  ('dr_salah', 'د. Salah Ali', 18, now() - interval '85 days', now(), true, now(), '11111111-1111-1111-1111-111111111111'),
  ('dr_nadia', 'د. Nadia Hassan', 15, now() - interval '80 days', now(), true, now(), '11111111-1111-1111-1111-111111111111'),
  ('dr_karim', 'د. Karim Farid', 12, now() - interval '75 days', now(), true, now(), '11111111-1111-1111-1111-111111111111'),
  ('dr_hesham', 'د. Hisham Nabil', 10, now() - interval '70 days', now(), false, NULL, NULL),
  ('dr_mona', 'د. Mona Tariq', 8, now() - interval '65 days', now(), true, now(), '11111111-1111-1111-1111-111111111111'),
  ('dr_amr', 'د. Amr Samir', 7, now() - interval '60 days', now(), false, NULL, NULL),
  ('dr_rana', 'د. Rana Adel', 6, now() - interval '55 days', now(), true, now(), '11111111-1111-1111-1111-111111111111')
ON CONFLICT (instructor_username) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  last_seen_at = now(),
  is_verified = EXCLUDED.is_verified;

-- ============================================================
-- 5. DISCOVERED COURSES
-- ============================================================
INSERT INTO public.discovered_courses (
  course_code, major, course_key, course_name, section,
  semester_code, seen_count, first_seen_at, last_seen_at,
  is_verified, verified_at, verified_by
)
VALUES
  ('CS101', 'CS', 'cs101', 'Introduction to Computer Science', 'A', '2026-1', 25, now() - interval '90 days', now(), true, now(), '11111111-1111-1111-1111-111111111111'),
  ('CS102', 'CS', 'cs102', 'Programming Fundamentals', 'A', '2026-1', 22, now() - interval '88 days', now(), true, now(), '11111111-1111-1111-1111-111111111111'),
  ('CS201', 'CS', 'cs201', 'Data Structures', 'A', '2025-2', 20, now() - interval '85 days', now(), true, now(), '11111111-1111-1111-1111-111111111111'),
  ('CS202', 'CS', 'cs202', 'Algorithms', 'A', '2025-2', 18, now() - interval '82 days', now(), true, now(), '11111111-1111-1111-1111-111111111111'),
  ('CS301', 'CS', 'cs301', 'Database Systems', 'A', '2025-1', 16, now() - interval '80 days', now(), true, now(), '11111111-1111-1111-1111-111111111111'),
  ('CS302', 'CS', 'cs302', 'Operating Systems', 'A', '2025-1', 14, now() - interval '78 days', now(), true, now(), '11111111-1111-1111-1111-111111111111'),
  ('CS401', 'CS', 'cs401', 'Software Engineering', 'A', '2024-2', 12, now() - interval '75 days', now(), true, now(), '11111111-1111-1111-1111-111111111111'),
  ('CS402', 'CS', 'cs402', 'Computer Networks', 'A', '2024-2', 11, now() - interval '72 days', now(), false, NULL, NULL),
  ('IS101', 'IS', 'is101', 'Introduction to Information Systems', 'A', '2026-1', 19, now() - interval '87 days', now(), true, now(), '11111111-1111-1111-1111-111111111111'),
  ('IS102', 'IS', 'is102', 'Business Programming', 'A', '2026-1', 17, now() - interval '84 days', now(), true, now(), '11111111-1111-1111-1111-111111111111'),
  ('IS201', 'IS', 'is201', 'Systems Analysis & Design', 'A', '2025-2', 15, now() - interval '81 days', now(), true, now(), '11111111-1111-1111-1111-111111111111'),
  ('IS202', 'IS', 'is202', 'Database Management', 'A', '2025-2', 13, now() - interval '79 days', now(), false, NULL, NULL),
  ('IT101', 'IT', 'it101', 'IT Fundamentals', 'A', '2026-1', 10, now() - interval '70 days', now(), true, now(), '11111111-1111-1111-1111-111111111111'),
  ('IT201', 'IT', 'it201', 'Web Technologies', 'A', '2025-2', 9, now() - interval '68 days', now(), false, NULL, NULL),
  ('AI301', 'AI', 'ai301', 'Machine Learning Basics', 'A', '2025-1', 7, now() - interval '60 days', now(), false, NULL, NULL),
  ('DS201', 'DS', 'ds201', 'Statistics for Data Science', 'A', '2025-2', 6, now() - interval '55 days', now(), false, NULL, NULL)
ON CONFLICT (course_code) DO UPDATE SET
  course_name = EXCLUDED.course_name,
  last_seen_at = now(),
  is_verified = EXCLUDED.is_verified;

-- ============================================================
-- 6. USER COURSE PROGRESS
-- ============================================================
INSERT INTO public.user_course_progress (user_id, course_code, status, updated_at)
VALUES
  ('22222222-2222-2222-2222-222222222222', 'CS101', 'passed', now() - interval '10 days'),
  ('22222222-2222-2222-2222-222222222222', 'CS102', 'passed', now() - interval '5 days'),
  ('22222222-2222-2222-2222-222222222222', 'CS201', 'passed', now()),
  ('22222222-2222-2222-2222-222222222222', 'CS202', 'carried', now()),
  ('33333333-3333-3333-3333-333333333333', 'IS101', 'passed', now() - interval '8 days'),
  ('33333333-3333-3333-3333-333333333333', 'IS102', 'passed', now() - interval '3 days'),
  ('33333333-3333-3333-3333-333333333333', 'IS201', 'carried', now()),
  ('44444444-4444-4444-4444-444444444444', 'CS101', 'passed', now() - interval '20 days'),
  ('44444444-4444-4444-4444-444444444444', 'CS102', 'passed', now() - interval '15 days'),
  ('44444444-4444-4444-4444-444444444444', 'CS201', 'passed', now() - interval '5 days'),
  ('55555555-5555-5555-5555-555555555555', 'CS101', 'passed', now() - interval '12 days'),
  ('55555555-5555-5555-5555-555555555555', 'CS102', 'carried', now()),
  ('66666666-6666-6666-6666-666666666666', 'IS101', 'passed', now() - interval '18 days'),
  ('66666666-6666-6666-6666-666666666666', 'IS102', 'passed', now() - interval '10 days'),
  ('77777777-7777-7777-7777-777777777777', 'CS101', 'passed', now() - interval '25 days'),
  ('77777777-7777-7777-7777-777777777777', 'CS201', 'carried', now()),
  ('88888888-8888-8888-8888-888888888888', 'IS101', 'passed', now() - interval '15 days'),
  ('88888888-8888-8888-8888-888888888888', 'IS201', 'carried', now()),
  ('99999999-9999-9999-9999-999999999999', 'CS101', 'passed', now() - interval '30 days'),
  ('99999999-9999-9999-9999-999999999999', 'CS301', 'carried', now()),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'CS101', 'passed', now() - interval '7 days'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'CS102', 'passed', now() - interval '2 days'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'IS101', 'passed', now() - interval '5 days'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'IS102', 'carried', now())
ON CONFLICT (user_id, course_code) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = now();

-- ============================================================
-- 7. SUBJECTS (Course Catalog with References)
-- ============================================================
-- Subjects table is created in 20260714000000_create_subjects_tables.sql
-- We assume it has: course_code, course_name, major, semester, description, created_at

INSERT INTO public.discovered_courses (course_code, major, course_key, course_name, section, semester_code, seen_count, first_seen_at, last_seen_at, is_verified, verified_at, verified_by)
SELECT 'CS101', 'CS', 'cs101', 'Introduction to Computer Science', 'A', '2026-1', 25, now() - interval '90 days', now(), true, now(), '11111111-1111-1111-1111-111111111111'
WHERE NOT EXISTS (SELECT 1 FROM public.discovered_courses WHERE course_code = 'CS101');

-- ============================================================
-- 8. SUBJECT REFERENCES (Video/Reference links per user)
-- ============================================================
INSERT INTO public.subject_references (id, course_code, user_id, type, title, url, description, created_at)
VALUES
  -- Ahmed's references
  (gen_random_uuid(), 'CS101', '22222222-2222-2222-2222-222222222222', 'video', 'CS101 - Lecture 1: Introduction', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Great intro lecture covering basics of CS', now() - interval '20 days'),
  (gen_random_uuid(), 'CS101', '22222222-2222-2222-2222-222222222222', 'reference', 'CS101 Textbook Chapter 1', 'https://example.com/cs101-ch1.pdf', 'PDF textbook reference', now() - interval '18 days'),
  (gen_random_uuid(), 'CS201', '22222222-2222-2222-2222-222222222222', 'video', 'Data Structures - Linked Lists', 'https://www.youtube.com/watch?v=example1', 'Clear explanation of linked lists', now() - interval '15 days'),
  (gen_random_uuid(), 'CS201', '22222222-2222-2222-2222-222222222222', 'link', 'GeeksforGeeks: Trees', 'https://geeksforgeeks.org/trees', 'Comprehensive trees tutorial', now() - interval '12 days'),
  -- Sara's references
  (gen_random_uuid(), 'IS101', '33333333-3333-3333-3333-333333333333', 'video', 'IS101 - What is Information Systems?', 'https://www.youtube.com/watch?v=example2', 'Overview of IS field', now() - interval '22 days'),
  (gen_random_uuid(), 'IS102', '33333333-3333-3333-3333-333333333333', 'reference', 'IS102 - Python Basics', 'https://example.com/python-basics.pdf', 'Python programming reference', now() - interval '19 days'),
  (gen_random_uuid(), 'IS201', '33333333-3333-3333-3333-333333333333', 'video', 'Systems Analysis - UML Diagrams', 'https://www.youtube.com/watch?v=example3', 'UML tutorial for IS students', now() - interval '16 days'),
  -- Omar's references
  (gen_random_uuid(), 'CS101', '44444444-4444-4444-4444-444444444444', 'video', 'CS101 Full Course', 'https://www.youtube.com/watch?v=example4', 'Complete CS101 course', now() - interval '25 days'),
  (gen_random_uuid(), 'CS301', '44444444-4444-4444-4444-444444444444', 'reference', 'Database Design Guide', 'https://example.com/db-design.pdf', 'ER diagrams and normalization', now() - interval '10 days'),
  -- Nour's references
  (gen_random_uuid(), 'CS102', '55555555-5555-5555-5555-555555555555', 'video', 'Programming in C - Full Course', 'https://www.youtube.com/watch?v=example5', 'C programming for beginners', now() - interval '14 days'),
  (gen_random_uuid(), 'CS202', '55555555-5555-5555-5555-555555555555', 'link', 'Algorithm Visualizer', 'https://algorithm-visualizer.org', 'Interactive algorithm visualizations', now() - interval '8 days'),
  -- Youssef's references
  (gen_random_uuid(), 'IS101', '66666666-6666-6666-6666-666666666666', 'video', 'IS Fundamentals', 'https://www.youtube.com/watch?v=example6', 'IS course overview', now() - interval '21 days'),
  (gen_random_uuid(), 'IS201', '66666666-6666-6666-6666-666666666666', 'reference', 'Systems Analysis Textbook', 'https://example.com/sa-textbook.pdf', 'SA&D reference material', now() - interval '11 days'),
  -- Layla's references
  (gen_random_uuid(), 'CS101', '77777777-7777-7777-7777-777777777777', 'video', 'CS101 - Binary Numbers', 'https://www.youtube.com/watch?v=example7', 'Understanding binary and number systems', now() - interval '17 days'),
  (gen_random_uuid(), 'CS301', '77777777-7777-7777-7777-777777777777', 'link', 'SQL Tutorial', 'https://w3schools.com/sql', 'SQL basics and advanced queries', now() - interval '9 days'),
  -- Khaled's references
  (gen_random_uuid(), 'IS101', '88888888-8888-8888-8888-888888888888', 'video', 'IS Career Paths', 'https://www.youtube.com/watch?v=example8', 'What you can do with IS degree', now() - interval '13 days'),
  (gen_random_uuid(), 'IS201', '88888888-8888-8888-8888-888888888888', 'reference', 'UML Reference Card', 'https://example.com/uml-ref.pdf', 'Quick UML reference', now() - interval '7 days'),
  -- Mariam's references
  (gen_random_uuid(), 'CS101', '99999999-9999-9999-9999-999999999999', 'video', 'CS101 - Logic Gates', 'https://www.youtube.com/watch?v=example9', 'Logic gates and circuits', now() - interval '20 days'),
  (gen_random_uuid(), 'CS201', '99999999-9999-9999-9999-999999999999', 'reference', 'Data Structures in Java', 'https://example.com/ds-java.pdf', 'Java implementation of DS', now() - interval '6 days'),
  -- Hassan's references
  (gen_random_uuid(), 'CS101', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'video', 'CS101 - Flowcharts', 'https://www.youtube.com/watch?v=example10', 'Algorithm flowcharts', now() - interval '4 days'),
  -- Dina's references
  (gen_random_uuid(), 'IS101', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'video', 'IS101 - Information Systems in Business', 'https://www.youtube.com/watch?v=example11', 'Business applications of IS', now() - interval '3 days'),
  (gen_random_uuid(), 'IS102', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'reference', 'Python for Business', 'https://example.com/python-biz.pdf', 'Python for IS students', now() - interval '2 days')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 9. STUDY GROUPS
-- ============================================================
INSERT INTO public.groups (
  id, name, course_name, course_code, class_number, doctor_name,
  major, max_members, current_members, whatsapp_link, group_link,
  is_full, creator_id, creator_name, created_at, updated_at
)
VALUES
  -- CS101 Groups
  (gen_random_uuid(), 'CS101 - Group A', 'Introduction to Computer Science', 'CS101', 'A1', 'د. Mahmoud Abdel Rahman', 'CS', 5, 3, 'https://chat.whatsapp.com/cs101a', 'https://t.me/cs101a', false, '22222222-2222-2222-2222-222222222222', 'Ahmed Mohamed', now() - interval '15 days', now() - interval '2 days'),
  (gen_random_uuid(), 'CS101 - Group B', 'Introduction to Computer Science', 'CS101', 'B1', 'د. Mahmoud Abdel Rahman', 'CS', 5, 5, 'https://chat.whatsapp.com/cs101b', 'https://t.me/cs101b', true, '44444444-4444-4444-4444-444444444444', 'Omar Hassan', now() - interval '14 days', now() - interval '1 day'),
  (gen_random_uuid(), 'CS101 - Group C', 'Introduction to Computer Science', 'CS101', 'C1', 'د. Mahmoud Abdel Rahman', 'CS', 5, 2, 'https://chat.whatsapp.com/cs101c', 'https://t.me/cs101c', false, '55555555-5555-5555-5555-555555555555', 'Nour Khaled', now() - interval '13 days', now()),
  -- CS201 Groups
  (gen_random_uuid(), 'CS201 - Study Squad', 'Data Structures', 'CS201', 'A2', 'د. Salah Ali', 'CS', 5, 4, 'https://chat.whatsapp.com/cs201a', 'https://t.me/cs201a', false, '22222222-2222-2222-2222-222222222222', 'Ahmed Mohamed', now() - interval '12 days', now() - interval '3 days'),
  (gen_random_uuid(), 'CS201 - Night Owls', 'Data Structures', 'CS201', 'B2', 'د. Salah Ali', 'CS', 5, 5, 'https://chat.whatsapp.com/cs201b', NULL, true, '77777777-7777-7777-7777-777777777777', 'Layla Mahmoud', now() - interval '11 days', now()),
  -- CS301 Groups
  (gen_random_uuid(), 'CS301 - DB Masters', 'Database Systems', 'CS301', 'A3', 'د. Nadia Hassan', 'CS', 5, 3, 'https://chat.whatsapp.com/cs301a', 'https://t.me/cs301a', false, '99999999-9999-9999-9999-999999999999', 'Mariam Tariq', now() - interval '10 days', now()),
  -- IS101 Groups
  (gen_random_uuid(), 'IS101 - Beginners', 'Introduction to Information Systems', 'IS101', 'A1', 'د. Karim Farid', 'IS', 5, 4, 'https://chat.whatsapp.com/is101a', 'https://t.me/is101a', false, '33333333-3333-3333-3333-333333333333', 'Sara Ali', now() - interval '9 days', now() - interval '1 day'),
  (gen_random_uuid(), 'IS101 - Future Analysts', 'Introduction to Information Systems', 'IS101', 'B1', 'د. Karim Farid', 'IS', 5, 5, 'https://chat.whatsapp.com/is101b', NULL, true, '66666666-6666-6666-6666-666666666666', 'Youssef Ibrahim', now() - interval '8 days', now()),
  -- IS201 Groups
  (gen_random_uuid(), 'IS201 - Design Team', 'Systems Analysis & Design', 'IS201', 'A2', 'د. Mona Tariq', 'IS', 5, 2, 'https://chat.whatsapp.com/is201a', 'https://t.me/is201a', false, '33333333-3333-3333-3333-333333333333', 'Sara Ali', now() - interval '7 days', now()),
  -- CS102 Groups
  (gen_random_uuid(), 'CS102 - Code Together', 'Programming Fundamentals', 'CS102', 'A1', 'د. Hisham Nabil', 'CS', 5, 3, 'https://chat.whatsapp.com/cs102a', 'https://t.me/cs102a', false, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Hassan Nabil', now() - interval '6 days', now()),
  -- IS102 Groups
  (gen_random_uuid(), 'IS102 - Pythonistas', 'Business Programming', 'IS102', 'A1', 'د. Amr Samir', 'IS', 5, 4, 'https://chat.whatsapp.com/is102a', 'https://t.me/is102a', false, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Dina Samir', now() - interval '5 days', now())
ON CONFLICT DO NOTHING;

-- ============================================================
-- 10. GROUP MEMBERS
-- ============================================================
-- We need to get the group IDs first. Since we used gen_random_uuid(),
-- we'll use a workaround by inserting members based on matching criteria.

-- For simplicity, we'll insert group members by joining with groups table
INSERT INTO public.group_members (group_id, user_id, joined_at)
SELECT g.id, m.user_id, now() - interval '10 days'
FROM public.groups g
JOIN (VALUES
  ('22222222-2222-2222-2222-222222222222', 'CS101 - Group A'),
  ('44444444-4444-4444-4444-444444444444', 'CS101 - Group A'),
  ('55555555-5555-5555-5555-555555555555', 'CS101 - Group A'),
  ('22222222-2222-2222-2222-222222222222', 'CS101 - Group B'),
  ('33333333-3333-3333-3333-333333333333', 'CS101 - Group B'),
  ('55555555-5555-5555-5555-555555555555', 'CS101 - Group B'),
  ('77777777-7777-7777-7777-777777777777', 'CS101 - Group B'),
  ('44444444-4444-4444-4444-444444444444', 'CS101 - Group C'),
  ('22222222-2222-2222-2222-222222222222', 'CS201 - Study Squad'),
  ('77777777-7777-7777-7777-777777777777', 'CS201 - Study Squad'),
  ('99999999-9999-9999-9999-999999999999', 'CS201 - Study Squad'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'CS201 - Study Squad'),
  ('22222222-2222-2222-2222-222222222222', 'CS201 - Night Owls'),
  ('55555555-5555-5555-5555-555555555555', 'CS201 - Night Owls'),
  ('77777777-7777-7777-7777-777777777777', 'CS201 - Night Owls'),
  ('99999999-9999-9999-9999-999999999999', 'CS201 - Night Owls'),
  ('44444444-4444-4444-4444-444444444444', 'CS201 - Night Owls'),
  ('99999999-9999-9999-9999-999999999999', 'CS301 - DB Masters'),
  ('22222222-2222-2222-2222-222222222222', 'CS301 - DB Masters'),
  ('77777777-7777-7777-7777-777777777777', 'CS301 - DB Masters'),
  ('33333333-3333-3333-3333-333333333333', 'IS101 - Beginners'),
  ('66666666-6666-6666-6666-666666666666', 'IS101 - Beginners'),
  ('88888888-8888-8888-8888-888888888888', 'IS101 - Beginners'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'IS101 - Beginners'),
  ('33333333-3333-3333-3333-333333333333', 'IS101 - Future Analysts'),
  ('66666666-6666-6666-6666-666666666666', 'IS101 - Future Analysts'),
  ('88888888-8888-8888-8888-888888888888', 'IS101 - Future Analysts'),
  ('55555555-5555-5555-5555-555555555555', 'IS101 - Future Analysts'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'IS101 - Future Analysts'),
  ('33333333-3333-3333-3333-333333333333', 'IS201 - Design Team'),
  ('66666666-6666-6666-6666-666666666666', 'IS201 - Design Team'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'CS102 - Code Together'),
  ('22222222-2222-2222-2222-222222222222', 'CS102 - Code Together'),
  ('55555555-5555-5555-5555-555555555555', 'CS102 - Code Together'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'IS102 - Pythonistas'),
  ('33333333-3333-3333-3333-333333333333', 'IS102 - Pythonistas'),
  ('66666666-6666-6666-6666-666666666666', 'IS102 - Pythonistas'),
  ('88888888-8888-8888-8888-888888888888', 'IS102 - Pythonistas')
) AS m(user_id, group_name)
ON g.name = m.group_name
ON CONFLICT (group_id, user_id) DO NOTHING;

-- Update group member counts
UPDATE public.groups g
SET current_members = (
  SELECT COUNT(*) FROM public.group_members gm WHERE gm.group_id = g.id
);

-- ============================================================
-- 11. EXAMS / TESTS
-- ============================================================
-- Tests table stores exam data with JSONB questions and settings

DO $$
DECLARE
  test1_id uuid := gen_random_uuid();
  test2_id uuid := gen_random_uuid();
  test3_id uuid := gen_random_uuid();
  test4_id uuid := gen_random_uuid();
  test5_id uuid := gen_random_uuid();
  test6_id uuid := gen_random_uuid();
  test7_id uuid := gen_random_uuid();
  test8_id uuid := gen_random_uuid();
  test9_id uuid := gen_random_uuid();
  test10_id uuid := gen_random_uuid();
  test11_id uuid := gen_random_uuid();
  test12_id uuid := gen_random_uuid();
BEGIN
  INSERT INTO public.tests (
    id, user_id, title, description, settings, questions,
    rating, rating_count, published, major, course_code,
    created_at, updated_at
  ) VALUES
  (
    test1_id,
    '22222222-2222-2222-2222-222222222222',
    'CS101 - Midterm Exam',
    'Comprehensive midterm covering chapters 1-5',
    '{"major":"CS","courseCode":"CS101","courseName":"Introduction to Computer Science","duration":60,"passingScore":60,"showAnswers":true,"randomizeQuestions":true,"attemptsAllowed":2}'::jsonb,
    '[
      {"id":"q1","text":"What is the binary representation of 10?","options":["1010","0101","1110","1100"],"correctIndex":0,"points":2},
      {"id":"q2","text":"Which of the following is NOT a programming language?","options":["Python","HTML","Java","C++"],"correctIndex":1,"points":2},
      {"id":"q3","text":"What does CPU stand for?","options":["Central Process Unit","Central Processing Unit","Computer Personal Unit","Central Processor Unit"],"correctIndex":1,"points":2},
      {"id":"q4","text":"Which data structure uses FIFO?","options":["Stack","Queue","Array","Tree"],"correctIndex":1,"points":2},
      {"id":"q5","text":"What is the time complexity of binary search?","options":["O(n)","O(log n)","O(n^2)","O(1)"],"correctIndex":1,"points":3}
    ]'::jsonb,
    4, 2, true, 'CS', 'CS101',
    now() - interval '20 days', now() - interval '5 days'
  ),
  (
    test2_id,
    '22222222-2222-2222-2222-222222222222',
    'CS201 - Data Structures Quiz',
    'Quiz on linked lists, stacks, and queues',
    '{"major":"CS","courseCode":"CS201","courseName":"Data Structures","duration":30,"passingScore":50,"showAnswers":true,"randomizeQuestions":false,"attemptsAllowed":3}'::jsonb,
    '[
      {"id":"q1","text":"Which data structure uses LIFO?","options":["Queue","Stack","Linked List","Tree"],"correctIndex":1,"points":2},
      {"id":"q2","text":"What is the head of a linked list?","options":["Last node","First node","Middle node","Null"],"correctIndex":1,"points":2},
      {"id":"q3","text":"Which is not a linear data structure?","options":["Array","Queue","Tree","Stack"],"correctIndex":2,"points":3}
    ]'::jsonb,
    5, 3, true, 'CS', 'CS201',
    now() - interval '18 days', now() - interval '4 days'
  ),
  (
    test3_id,
    '44444444-4444-4444-4444-444444444444',
    'CS101 - Practice Test',
    'Practice questions for CS101 final',
    '{"major":"CS","courseCode":"CS101","courseName":"Introduction to Computer Science","duration":45,"passingScore":60,"showAnswers":true,"randomizeQuestions":true,"attemptsAllowed":1}'::jsonb,
    '[
      {"id":"q1","text":"What is 2^8?","options":["256","128","512","64"],"correctIndex":0,"points":2},
      {"id":"q2","text":"Which is a high-level language?","options":["Assembly","Machine Code","Python","Binary"],"correctIndex":2,"points":2}
    ]'::jsonb,
    3, 1, true, 'CS', 'CS101',
    now() - interval '15 days', now() - interval '3 days'
  ),
  (
    test4_id,
    '33333333-3333-3333-3333-333333333333',
    'IS101 - Information Systems Quiz',
    'Quiz covering IS fundamentals and business processes',
    '{"major":"IS","courseCode":"IS101","courseName":"Introduction to Information Systems","duration":25,"passingScore":50,"showAnswers":false,"randomizeQuestions":false,"attemptsAllowed":2}'::jsonb,
    '[
      {"id":"q1","text":"What is an ERP system?","options":["Email Resource Plan","Enterprise Resource Planning","Electronic Record Process","Extended Research Platform"],"correctIndex":1,"points":2},
      {"id":"q2","text":"Which is NOT a type of information system?","options":["TPS","MIS","DSS","CPU"],"correctIndex":3,"points":2},
      {"id":"q3","text":"What does BPM stand for?","options":["Business Process Management","Business Project Management","Business Performance Measure","Business Policy Manual"],"correctIndex":0,"points":2}
    ]'::jsonb,
    4, 2, true, 'IS', 'IS101',
    now() - interval '12 days', now() - interval '2 days'
  ),
  (
    test5_id,
    '55555555-5555-5555-5555-555555555555',
    'CS202 - Algorithms Challenge',
    'Algorithm complexity and design patterns',
    '{"major":"CS","courseCode":"CS202","courseName":"Algorithms","duration":50,"passingScore":60,"showAnswers":true,"randomizeQuestions":true,"attemptsAllowed":2}'::jsonb,
    '[
      {"id":"q1","text":"What is the worst-case time complexity of quicksort?","options":["O(n)","O(n log n)","O(n^2)","O(log n)"],"correctIndex":2,"points":3},
      {"id":"q2","text":"Which algorithm uses divide and conquer?","options":["Bubble Sort","Merge Sort","Linear Search","Insertion Sort"],"correctIndex":1,"points":2},
      {"id":"q3","text":"What is dynamic programming?","options":["Programming with dynamic types","Breaking problems into overlapping subproblems","Writing code on the fly","Using dynamic languages"],"correctIndex":1,"points":3}
    ]'::jsonb,
    5, 1, false, 'CS', 'CS202',
    now() - interval '8 days', now() - interval '1 day'
  ),
  (
    test6_id,
    '77777777-7777-7777-7777-777777777777',
    'CS301 - SQL Fundamentals',
    'SQL queries, joins, and database design',
    '{"major":"CS","courseCode":"CS301","courseName":"Database Systems","duration":40,"passingScore":60,"showAnswers":true,"randomizeQuestions":false,"attemptsAllowed":2}'::jsonb,
    '[
      {"id":"q1","text":"Which SQL statement is used to extract data?","options":["SELECT","EXTRACT","GET","PULL"],"correctIndex":0,"points":2},
      {"id":"q2","text":"What does JOIN do?","options":["Combines rows from tables","Sorts data","Filters rows","Updates data"],"correctIndex":0,"points":2},
      {"id":"q3","text":"Which is a SQL constraint?","options":["LOOP","PRIMARY KEY","FUNCTION","TRIGGER"],"correctIndex":1,"points":2}
    ]'::jsonb,
    4, 2, true, 'CS', 'CS301',
    now() - interval '6 days', now()
  ),
  (
    test7_id,
    '33333333-3333-3333-3333-333333333333',
    'IS201 - Systems Analysis',
    'UML diagrams and system design principles',
    '{"major":"IS","courseCode":"IS201","courseName":"Systems Analysis & Design","duration":35,"passingScore":50,"showAnswers":false,"randomizeQuestions":false,"attemptsAllowed":1}'::jsonb,
    '[
      {"id":"q1","text":"What does UML stand for?","options":["Unified Modeling Language","Universal Markup Language","User Module Layout","United Method Logic"],"correctIndex":0,"points":2},
      {"id":"q2","text":"Which diagram shows class relationships?","options":["Sequence","Use Case","Class","Activity"],"correctIndex":2,"points":2}
    ]'::jsonb,
    5, 2, true, 'IS', 'IS201',
    now() - interval '5 days', now()
  ),
  (
    test8_id,
    '88888888-8888-8888-8888-888888888888',
    'IS101 - Business Process Quiz',
    'Business processes and information flow',
    '{"major":"IS","courseCode":"IS101","courseName":"Introduction to Information Systems","duration":20,"passingScore":50,"showAnswers":true,"randomizeQuestions":false,"attemptsAllowed":2}'::jsonb,
    '[
      {"id":"q1","text":"What is a business process?","options":["A company logo","A set of activities to achieve a goal","A type of software","An employee role"],"correctIndex":1,"points":2},
      {"id":"q2","text":"Which is a type of BPM?","options":["Documentation","Modeling","Execution","All of the above"],"correctIndex":3,"points":2}
    ]'::jsonb,
    3, 1, true, 'IS', 'IS101',
    now() - interval '4 days', now()
  ),
  (
    test9_id,
    '99999999-9999-9999-9999-999999999999',
    'CS101 - Final Exam Prep',
    'Comprehensive final exam preparation',
    '{"major":"CS","courseCode":"CS101","courseName":"Introduction to Computer Science","duration":90,"passingScore":60,"showAnswers":true,"randomizeQuestions":true,"attemptsAllowed":1}'::jsonb,
    '[
      {"id":"q1","text":"Convert binary 1101 to decimal.","options":["13","14","15","12"],"correctIndex":0,"points":2},
      {"id":"q2","text":"Which protocol is used for web pages?","options":["FTP","HTTP","SMTP","SSH"],"correctIndex":1,"points":2},
      {"id":"q3","text":"What is a variable?","options":["A fixed value","A named storage location","A type of loop","A function"],"correctIndex":1,"points":2}
    ]'::jsonb,
    4, 3, true, 'CS', 'CS101',
    now() - interval '3 days', now()
  ),
  (
    test10_id,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'CS102 - Programming Basics',
    'Basic programming concepts in C',
    '{"major":"CS","courseCode":"CS102","courseName":"Programming Fundamentals","duration":30,"passingScore":50,"showAnswers":true,"randomizeQuestions":false,"attemptsAllowed":2}'::jsonb,
    '[
      {"id":"q1","text":"What is a function?","options":["A data type","A reusable block of code","A variable","A comment"],"correctIndex":1,"points":2},
      {"id":"q2","text":"Which loop executes at least once?","options":["for","while","do-while","foreach"],"correctIndex":2,"points":2}
    ]'::jsonb,
    3, 1, false, 'CS', 'CS102',
    now() - interval '2 days', now()
  ),
  (
    test11_id,
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'IS102 - Python Quiz',
    'Python programming for business students',
    '{"major":"IS","courseCode":"IS102","courseName":"Business Programming","duration":25,"passingScore":50,"showAnswers":true,"randomizeQuestions":false,"attemptsAllowed":2}'::jsonb,
    '[
      {"id":"q1","text":"How do you start a function in Python?","options":["function myFunc()","def myFunc():","func myFunc()","define myFunc()"],"correctIndex":1,"points":2},
      {"id":"q2","text":"Which is a mutable data type?","options":["tuple","string","list","int"],"correctIndex":2,"points":2}
    ]'::jsonb,
    4, 2, true, 'IS', 'IS102',
    now() - interval '1 day', now()
  ),
  (
    test12_id,
    '22222222-2222-2222-2222-222222222222',
    'CS301 - Database Design',
    'ER diagrams and normalization',
    '{"major":"CS","courseCode":"CS301","courseName":"Database Systems","duration":40,"passingScore":60,"showAnswers":true,"randomizeQuestions":true,"attemptsAllowed":2}'::jsonb,
    '[
      {"id":"q1","text":"What is normalization?","options":["Increasing data redundancy","Organizing data to reduce redundancy","Deleting data","Backing up data"],"correctIndex":1,"points":2},
      {"id":"q2","text":"What is a primary key?","options":["Any column","A unique identifier for a row","A foreign key","An index"],"correctIndex":1,"points":2},
      {"id":"q3","text":"Which normal form eliminates transitive dependencies?","options":["1NF","2NF","3NF","BCNF"],"correctIndex":2,"points":3}
    ]'::jsonb,
    5, 2, true, 'CS', 'CS301',
    now(), now()
  )
  ON CONFLICT (id) DO NOTHING;

  -- Store test IDs in a temp table for later use
  CREATE TEMP TABLE seed_tests (test_id uuid, test_name text) ON COMMIT DROP;
  INSERT INTO seed_tests VALUES
    (test1_id, 'CS101 - Midterm Exam'),
    (test2_id, 'CS201 - Data Structures Quiz'),
    (test3_id, 'CS101 - Practice Test'),
    (test4_id, 'IS101 - Information Systems Quiz'),
    (test5_id, 'CS202 - Algorithms Challenge'),
    (test6_id, 'CS301 - SQL Fundamentals'),
    (test7_id, 'IS201 - Systems Analysis'),
    (test8_id, 'IS101 - Business Process Quiz'),
    (test9_id, 'CS101 - Final Exam Prep'),
    (test10_id, 'CS102 - Programming Basics'),
    (test11_id, 'IS102 - Python Quiz'),
    (test12_id, 'CS301 - Database Design');
END $$;

-- ============================================================
-- 12. TEST RATINGS
-- ============================================================
INSERT INTO public.test_ratings (test_id, user_id, rating, created_at)
SELECT t.test_id, u.user_id, (random() * 2 + 3)::int, now() - interval '5 days'
FROM seed_tests t
CROSS JOIN LATERAL (
  VALUES
    ('22222222-2222-2222-2222-222222222222'),
    ('33333333-3333-3333-3333-333333333333'),
    ('44444444-4444-4444-4444-444444444444'),
    ('55555555-5555-5555-5555-555555555555'),
    ('66666666-6666-6666-6666-666666666666')
) AS u(user_id)
WHERE t.test_id IN (
  SELECT id FROM public.tests WHERE published = true LIMIT 6
)
ON CONFLICT (test_id, user_id) DO NOTHING;

-- ============================================================
-- 13. TEST ATTEMPTS
-- ============================================================
INSERT INTO public.test_attempts (id, test_id, user_id, score, total, answers, completed_at)
VALUES
  -- Ahmed's attempts
  (gen_random_uuid(), (SELECT id FROM public.tests WHERE title = 'CS101 - Midterm Exam' LIMIT 1), '22222222-2222-2222-2222-222222222222', 4, 5, '{"q1":"a","q2":"b","q3":"b","q4":"b","q5":"b"}'::jsonb, now() - interval '15 days'),
  (gen_random_uuid(), (SELECT id FROM public.tests WHERE title = 'CS201 - Data Structures Quiz' LIMIT 1), '22222222-2222-2222-2222-222222222222', 2, 3, '{"q1":"a","q2":"a","q3":"c"}'::jsonb, now() - interval '10 days'),
  (gen_random_uuid(), (SELECT id FROM public.tests WHERE title = 'CS101 - Midterm Exam' LIMIT 1), '22222222-2222-2222-2222-222222222222', 5, 5, '{"q1":"a","q2":"b","q3":"b","q4":"b","q5":"b"}'::jsonb, now() - interval '5 days'),
  -- Sara's attempts
  (gen_random_uuid(), (SELECT id FROM public.tests WHERE title = 'IS101 - Information Systems Quiz' LIMIT 1), '33333333-3333-3333-3333-333333333333', 2, 3, '{"q1":"a","q2":"d","q3":"a"}'::jsonb, now() - interval '12 days'),
  (gen_random_uuid(), (SELECT id FROM public.tests WHERE title = 'IS101 - Information Systems Quiz' LIMIT 1), '33333333-3333-3333-3333-333333333333', 3, 3, '{"q1":"a","q2":"d","q3":"a"}'::jsonb, now() - interval '8 days'),
  -- Omar's attempts
  (gen_random_uuid(), (SELECT id FROM public.tests WHERE title = 'CS101 - Practice Test' LIMIT 1), '44444444-4444-4444-4444-444444444444', 2, 2, '{"q1":"a","q2":"c"}'::jsonb, now() - interval '14 days'),
  (gen_random_uuid(), (SELECT id FROM public.tests WHERE title = 'CS101 - Midterm Exam' LIMIT 1), '44444444-4444-4444-4444-444444444444', 3, 5, '{"q1":"b","q2":"b","q3":"a","q4":"a","q5":"d"}'::jsonb, now() - interval '7 days'),
  -- Nour's attempts
  (gen_random_uuid(), (SELECT id FROM public.tests WHERE title = 'CS201 - Data Structures Quiz' LIMIT 1), '55555555-5555-5555-5555-555555555555', 3, 3, '{"q1":"b","q2":"b","q3":"c"}'::jsonb, now() - interval '9 days'),
  -- Youssef's attempts
  (gen_random_uuid(), (SELECT id FROM public.tests WHERE title = 'IS101 - Information Systems Quiz' LIMIT 1), '66666666-6666-6666-6666-666666666666', 2, 3, '{"q1":"a","q2":"d","q3":"a"}'::jsonb, now() - interval '11 days'),
  (gen_random_uuid(), (SELECT id FROM public.tests WHERE title = 'IS201 - Systems Analysis' LIMIT 1), '66666666-6666-6666-6666-666666666666', 2, 2, '{"q1":"a","q2":"c"}'::jsonb, now() - interval '6 days'),
  -- Layla's attempts
  (gen_random_uuid(), (SELECT id FROM public.tests WHERE title = 'CS301 - SQL Fundamentals' LIMIT 1), '77777777-7777-7777-7777-777777777777', 3, 3, '{"q1":"a","q2":"a","q3":"b"}'::jsonb, now() - interval '4 days'),
  -- Khaled's attempts
  (gen_random_uuid(), (SELECT id FROM public.tests WHERE title = 'IS101 - Business Process Quiz' LIMIT 1), '88888888-8888-8888-8888-888888888888', 2, 2, '{"q1":"b","q2":"d"}'::jsonb, now() - interval '3 days'),
  -- Mariam's attempts
  (gen_random_uuid(), (SELECT id FROM public.tests WHERE title = 'CS101 - Final Exam Prep' LIMIT 1), '99999999-9999-9999-9999-999999999999', 3, 3, '{"q1":"a","q2":"b","q3":"b"}'::jsonb, now() - interval '2 days'),
  -- Hassan's attempts
  (gen_random_uuid(), (SELECT id FROM public.tests WHERE title = 'CS102 - Programming Basics' LIMIT 1), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 2, 2, '{"q1":"b","q2":"c"}'::jsonb, now() - interval '1 day'),
  -- Dina's attempts
  (gen_random_uuid(), (SELECT id FROM public.tests WHERE title = 'IS102 - Python Quiz' LIMIT 1), 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 2, 2, '{"q1":"b","q2":"c"}'::jsonb, now())
ON CONFLICT DO NOTHING;

-- ============================================================
-- 14. NOTIFICATIONS
-- ============================================================
INSERT INTO public.notifications (id, user_id, title, body, read, type, created_by, priority, created_at)
VALUES
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'New Exam Published', 'CS101 - Midterm Exam has been published', false, 'exam', '11111111-1111-1111-1111-111111111111', 'normal', now() - interval '2 hours'),
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Study Group Invitation', 'You have been invited to join IS101 - Beginners', true, 'group', '33333333-3333-3333-3333-333333333333', 'normal', now() - interval '1 day'),
  (gen_random_uuid(), '44444444-4444-4444-4444-444444444444', 'Exam Reminder', 'CS101 - Practice Test is due tomorrow', false, 'exam', '11111111-1111-1111-1111-111111111111', 'high', now() - interval '3 hours'),
  (gen_random_uuid(), '55555555-5555-5555-5555-555555555555', 'New Reference Added', 'CS201 - Linked Lists video has been added to your course', false, 'reference', '22222222-2222-2222-2222-222222222222', 'normal', now() - interval '5 hours'),
  (gen_random_uuid(), '66666666-6666-6666-6666-666666666666', 'Group Update', 'IS101 - Future Analysts is now full', true, 'group', '66666666-6666-6666-6666-666666666666', 'normal', now() - interval '2 days'),
  (gen_random_uuid(), '77777777-7777-7777-7777-777777777777', 'New Notification', 'CS301 - SQL Fundamentals exam is now available', false, 'exam', '11111111-1111-1111-1111-111111111111', 'high', now() - interval '1 hour'),
  (gen_random_uuid(), '88888888-8888-8888-8888-888888888888', 'Welcome to SVU Community', 'Complete your profile and start exploring!', true, 'user', '11111111-1111-1111-1111-111111111111', 'normal', now() - interval '7 days'),
  (gen_random_uuid(), '99999999-9999-9999-9999-999999999999', 'Exam Completed', 'You completed CS101 - Midterm Exam with score 4/5', true, 'exam', '11111111-1111-1111-1111-111111111111', 'normal', now() - interval '3 days'),
  (gen_random_uuid(), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'New Study Group', 'CS102 - Code Together group is looking for members', false, 'group', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'normal', now() - interval '4 hours'),
  (gen_random_uuid(), 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Course Update', 'IS102 - Python Quiz has been updated with new questions', false, 'exam', '11111111-1111-1111-1111-111111111111', 'normal', now() - interval '6 hours'),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Admin Announcement', 'System maintenance scheduled for tonight', true, 'admin', '11111111-1111-1111-1111-111111111111', 'high', now() - interval '1 day'),
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Grade Posted', 'Your grade for IS101 has been posted', false, 'exam', '11111111-1111-1111-1111-111111111111', 'high', now() - interval '12 hours')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 15. RAW EXTRACTIONS (for admin extraction feature)
-- ============================================================
INSERT INTO public.raw_extractions (id, user_id, raw_markdown, detected_schema, created_at)
VALUES
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
   '# CS101 - Introduction to Computer Science
## Professor: Dr. Mahmoud Abdel Rahman
## Schedule: Sunday, Tuesday 10:00 AM - 11:30 AM
## Credits: 3

# CS201 - Data Structures
## Professor: Dr. Salah Ali
## Schedule: Monday, Wednesday 2:00 PM - 3:30 PM
## Credits: 3

# IS101 - Introduction to Information Systems
## Professor: Dr. Karim Farid
## Schedule: Sunday, Tuesday 12:00 PM - 1:30 PM
## Credits: 3',
   '{"semester":"2026-1","major":"CS","courses":[{"code":"CS101","name":"Introduction to Computer Science","instructor":"Dr. Mahmoud Abdel Rahman"},{"code":"CS201","name":"Data Structures","instructor":"Dr. Salah Ali"},{"code":"IS101","name":"Introduction to Information Systems","instructor":"Dr. Karim Farid"}]}'::jsonb,
   now() - interval '10 days'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
   '# IS201 - Systems Analysis & Design
## Professor: Dr. Mona Tariq
## Schedule: Monday, Wednesday 10:00 AM - 11:30 AM
## Credits: 3

# IS102 - Business Programming
## Professor: Dr. Amr Samir
## Schedule: Sunday, Tuesday 2:00 PM - 3:30 PM
## Credits: 3',
   '{"semester":"2026-1","major":"IS","courses":[{"code":"IS201","name":"Systems Analysis & Design","instructor":"Dr. Mona Tariq"},{"code":"IS102","name":"Business Programming","instructor":"Dr. Amr Samir"}]}'::jsonb,
   now() - interval '5 days'),
  (gen_random_uuid(), '44444444-4444-4444-4444-444444444444',
   '# CS301 - Database Systems
## Professor: Dr. Nadia Hassan
## Schedule: Sunday, Tuesday 8:00 AM - 9:30 AM
## Credits: 3',
   '{"semester":"2025-1","major":"CS","courses":[{"code":"CS301","name":"Database Systems","instructor":"Dr. Nadia Hassan"}]}'::jsonb,
   now() - interval '3 days')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 16. EXTRACTED COURSES (from raw extractions)
-- ============================================================
INSERT INTO public.extracted_courses (id, extraction_id, course_name, semester_code, full_code, instructor_name, instructor_username, major, course_key, section, semester_year, discovered_course_code, discovered_instructor_username, created_at)
SELECT
  gen_random_uuid(),
  re.id,
  c.course_name,
  c.semester_code,
  c.full_code,
  c.instructor_name,
  c.instructor_username,
  c.major,
  c.course_key,
  c.section,
  c.semester_year,
  c.discovered_course_code,
  c.discovered_instructor_username,
  now()
FROM public.raw_extractions re
CROSS JOIN LATERAL (
  VALUES
    ('Introduction to Computer Science', '2026-1', 'CS101', 'Dr. Mahmoud Abdel Rahman', 'dr_mahmoud', 'CS', 'cs101', 'A', '2026', 'CS101', 'dr_mahmoud'),
    ('Data Structures', '2026-1', 'CS201', 'Dr. Salah Ali', 'dr_salah', 'CS', 'cs201', 'A', '2026', 'CS201', 'dr_salah'),
    ('Introduction to Information Systems', '2026-1', 'IS101', 'Dr. Karim Farid', 'dr_karim', 'IS', 'is101', 'A', '2026', 'IS101', 'dr_karim'),
    ('Systems Analysis & Design', '2026-1', 'IS201', 'Dr. Mona Tariq', 'dr_mona', 'IS', 'is201', 'A', '2026', 'IS201', 'dr_mona'),
    ('Business Programming', '2026-1', 'IS102', 'Dr. Amr Samir', 'dr_amr', 'IS', 'is102', 'A', '2026', 'IS102', 'dr_amr'),
    ('Database Systems', '2025-1', 'CS301', 'Dr. Nadia Hassan', 'dr_nadia', 'CS', 'cs301', 'A', '2025', 'CS301', 'dr_nadia')
) AS c(course_name, semester_code, full_code, instructor_name, instructor_username, major, course_key, section, semester_year, discovered_course_code, discovered_instructor_username)
WHERE re.raw_markdown LIKE '%' || c.full_code || '%'
ON CONFLICT DO NOTHING;

-- ============================================================
-- 17. ADMIN AUDIT LOG
-- ============================================================
INSERT INTO public.admin_audit_log (id, caller_id, action, payload, ip_address, user_agent, created_at)
VALUES
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'user.role_updated', '{"target_user_id":"22222222-2222-2222-2222-222222222222","old_role":"student","new_role":"student"}'::jsonb, '127.0.0.1', 'Mozilla/5.0', now() - interval '30 days'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'test.published', '{"test_id":"CS101-Midterm","title":"CS101 - Midterm Exam"}'::jsonb, '127.0.0.1', 'Mozilla/5.0', now() - interval '20 days'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'course.verified', '{"course_code":"CS101","instructor":"dr_mahmoud"}'::jsonb, '127.0.0.1', 'Mozilla/5.0', now() - interval '15 days'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'notification.sent', '{"title":"System Maintenance","recipient_count":11}'::jsonb, '127.0.0.1', 'Mozilla/5.0', now() - interval '10 days'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'extraction.processed', '{"extraction_id":"admin-import-1","courses_found":6}'::jsonb, '127.0.0.1', 'Mozilla/5.0', now() - interval '5 days')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 18. RATE LIMITS (for rate limiting functionality)
-- ============================================================
INSERT INTO public.rate_limits (key, count, reset_at)
VALUES
  ('test-creation:22222222-2222-2222-2222-222222222222', 5, now() + interval '1 minute'),
  ('test-rating:33333333-3333-3333-3333-333333333333', 3, now() + interval '1 minute'),
  ('group-creation:44444444-4444-4444-4444-444444444444', 2, now() + interval '1 minute')
ON CONFLICT (key) DO UPDATE SET count = EXCLUDED.count, reset_at = EXCLUDED.reset_at;

-- ============================================================
-- Cleanup temp table
-- ============================================================
DROP TABLE IF EXISTS seed_tests;

-- ============================================================
-- Verification Queries
-- ============================================================
-- Run these to verify the seed data:
--
-- SELECT count(*) FROM auth.users;
-- SELECT count(*) FROM public.profiles;
-- SELECT count(*) FROM public.tests;
-- SELECT count(*) FROM public.groups;
-- SELECT count(*) FROM public.group_members;
-- SELECT count(*) FROM public.test_attempts;
-- SELECT count(*) FROM public.notifications;
-- SELECT count(*) FROM public.subject_references;
-- SELECT count(*) FROM public.discovered_courses;
--
-- ============================================================
-- Seed Complete!
-- ============================================================
-- Test Accounts:
--   Admin:    admin@svu.edu / password123
--   Student1: ahmed@svu.edu / password123
--   Student2: sara@svu.edu / password123
--   Student3: omar@svu.edu / password123
--   ... and more (all use password123)
-- ============================================================
