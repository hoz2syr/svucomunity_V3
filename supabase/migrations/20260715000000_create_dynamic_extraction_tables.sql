-- Migration: Create dynamic schedule extraction tables
-- Created: 2026-07-15
-- Purpose: Self-learning extraction pipeline with raw log, per-user courses, and auto-discovered catalog

-- ============================================================================
-- Table 1: raw_extractions — Immutable audit log of every upload
-- ============================================================================
create table public.raw_extractions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  raw_markdown text not null,
  detected_schema jsonb not null default '{}',
  created_at timestamptz default now()
);

create index idx_raw_extractions_user
  on public.raw_extractions (user_id);

create index idx_raw_extractions_created
  on public.raw_extractions (created_at desc);

alter table public.raw_extractions enable row level security;

-- Users can view their own extractions
create policy "Users view own raw extractions"
  on public.raw_extractions
  for select
  using (auth.uid() = user_id);

-- Users can insert their own extractions
create policy "Users insert own raw extractions"
  on public.raw_extractions
  for insert
  with check (auth.uid() = user_id);

-- No UPDATE policy — raw_extractions is immutable


-- ============================================================================
-- Table 2: extracted_courses — Per-user extracted course data
-- ============================================================================
create table public.extracted_courses (
  id uuid primary key default gen_random_uuid(),
  extraction_id uuid not null references public.raw_extractions(id) on delete cascade,

  -- Raw extracted data
  course_name text not null,
  semester_code text not null,
  full_code text not null,
  instructor_name text,
  instructor_username text,

  -- Parsed components from full_code
  major text not null,
  course_key text not null,
  section text,
  semester_year text not null,

  -- Optional FK to discovered catalog (filled automatically)
  discovered_course_code text,
  discovered_instructor_username text,

  created_at timestamptz default now()
);

create index idx_extracted_courses_extraction
  on public.extracted_courses (extraction_id);

create index idx_extracted_courses_major
  on public.extracted_courses (major);

create index idx_extracted_courses_semester
  on public.extracted_courses (semester_code);

create index idx_extracted_courses_full_code
  on public.extracted_courses (full_code);

alter table public.extracted_courses enable row level security;

-- Users can view their own extracted courses (via extraction ownership)
create policy "Users view own extracted courses"
  on public.extracted_courses
  for select
  using (
    exists (
      select 1 from public.raw_extractions
      where raw_extractions.id = extracted_courses.extraction_id
        and raw_extractions.user_id = auth.uid()
    )
  );

-- Users can insert their own extracted courses (via extraction ownership)
create policy "Users insert own extracted courses"
  on public.extracted_courses
  for insert
  with check (
    exists (
      select 1 from public.raw_extractions
      where raw_extractions.id = extracted_courses.extraction_id
        and raw_extractions.user_id = auth.uid()
    )
  );

-- No UPDATE policy — extracted_courses is immutable


-- ============================================================================
-- Table 3a: discovered_courses — Auto-discovered course catalog
-- ============================================================================
create table public.discovered_courses (
  course_code text primary key,
  major text not null,
  course_key text not null,
  course_name text not null,
  section text,
  semester_code text not null,
  seen_count int not null default 1,
  first_seen_at timestamptz default now(),
  last_seen_at timestamptz default now(),
  is_verified boolean default false,
  verified_at timestamptz,
  verified_by uuid references auth.users(id)
);

create index idx_discovered_courses_major
  on public.discovered_courses (major);

create index idx_discovered_courses_seen_count
  on public.discovered_courses (seen_count desc);

alter table public.discovered_courses enable row level security;

-- All authenticated users can view discovered courses (public catalog)
create policy "Authenticated users view discovered courses"
  on public.discovered_courses
  for select
  to authenticated
  using (true);


-- ============================================================================
-- Table 3b: discovered_instructors — Auto-discovered instructor directory
-- ============================================================================
create table public.discovered_instructors (
  instructor_username text primary key,
  full_name text not null,
  seen_count int not null default 1,
  first_seen_at timestamptz default now(),
  last_seen_at timestamptz default now(),
  is_verified boolean default false
);

create index idx_discovered_instructors_seen_count
  on public.discovered_instructors (seen_count desc);

alter table public.discovered_instructors enable row level security;

-- All authenticated users can view discovered instructors (public directory)
create policy "Authenticated users view discovered instructors"
  on public.discovered_instructors
  for select
  to authenticated
  using (true);


-- ============================================================================
-- Table 3c: discovered_majors — Auto-discovered major registry
-- ============================================================================
create table public.discovered_majors (
  major_code text primary key,
  major_name_ar text,
  major_name_en text,
  seen_count int not null default 1,
  first_seen_at timestamptz default now()
);

create index idx_discovered_majors_seen_count
  on public.discovered_majors (seen_count desc);

alter table public.discovered_majors enable row level security;

-- All authenticated users can view discovered majors (public registry)
create policy "Authenticated users view discovered majors"
  on public.discovered_majors
  for select
  to authenticated
  using (true);
