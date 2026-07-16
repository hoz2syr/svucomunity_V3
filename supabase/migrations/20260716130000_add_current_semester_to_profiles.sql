-- Migration: Add current_semester to profiles for user personalization
-- Created: 2026-07-16
-- Purpose: Track each user's current semester to enable dynamic UI customization,
--          relevant study group suggestions, and schedule-aware features.

alter table public.profiles
  add column if not exists current_semester text;

comment on column public.profiles.current_semester is
  'Current semester code (e.g. S25) used for personalization and study group matching';
