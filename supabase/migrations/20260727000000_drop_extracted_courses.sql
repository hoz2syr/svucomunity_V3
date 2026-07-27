-- Migration: Remove extracted_courses table
-- Created: 2026-07-27
-- Purpose: Per-student per-semester storage is now handled by student_semesters + student_semester_courses

drop table if exists public.extracted_courses cascade;
