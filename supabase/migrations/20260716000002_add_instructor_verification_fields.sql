-- Migration: Add verified_by and verified_at to discovered_instructors
-- Created: 2026-07-16
-- Purpose: Track who verified an instructor and when, matching discovered_courses pattern

alter table public.discovered_instructors
  add column if not exists verified_at timestamptz null;

alter table public.discovered_instructors
  add column if not exists verified_by text null;

create index if not exists idx_discovered_instructors_verified_by
  on public.discovered_instructors (verified_by);
