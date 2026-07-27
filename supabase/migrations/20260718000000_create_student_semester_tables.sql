-- Migration: Create student semester tables for structured per-user per-semester course storage
-- Created: 2026-07-18
-- Purpose: Replace ad-hoc extracted_courses usage with explicit student_semesters + student_semester_courses

-- ============================================================================
-- Table 1: student_semesters — One record per student per semester
-- ============================================================================
create table public.student_semesters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  semester_code text not null,
  semester_year text not null,
  course_count int not null default 0,
  created_at timestamptz default now(),

  constraint uq_student_semester unique (user_id, semester_code)
);

create index idx_student_semesters_user
  on public.student_semesters (user_id);

create index idx_student_semesters_semester
  on public.student_semesters (semester_code);

alter table public.student_semesters enable row level security;

create policy "Users view own semesters"
  on public.student_semesters
  for select
  using (auth.uid() = user_id);

create policy "Users insert own semesters"
  on public.student_semesters
  for insert
  with check (auth.uid() = user_id);

create policy "Users update own semesters"
  on public.student_semesters
  for update
  using (auth.uid() = user_id);

-- ============================================================================
-- Table 2: student_semester_courses — Courses for a specific student semester
-- ============================================================================
create table public.student_semester_courses (
  id uuid primary key default gen_random_uuid(),
  semester_id uuid not null references public.student_semesters(id) on delete cascade,

  course_name text not null,
  full_code text not null,
  instructor_name text,
  instructor_username text,
  major text not null,
  course_key text not null,
  section text,

  created_at timestamptz default now(),

  constraint uq_semester_course unique (semester_id, full_code)
);

create index idx_student_semester_courses_semester
  on public.student_semester_courses (semester_id);

create index idx_student_semester_courses_full_code
  on public.student_semester_courses (full_code);

alter table public.student_semester_courses enable row level security;

create policy "Users view own semester courses"
  on public.student_semester_courses
  for select
  using (
    exists (
      select 1 from public.student_semesters
      where student_semesters.id = student_semester_courses.semester_id
        and student_semesters.user_id = auth.uid()
    )
  );

create policy "Users insert own semester courses"
  on public.student_semester_courses
  for insert
  with check (
    exists (
      select 1 from public.student_semesters
      where student_semesters.id = student_semester_courses.semester_id
        and student_semesters.user_id = auth.uid()
    )
  );
