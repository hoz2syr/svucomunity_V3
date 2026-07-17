-- Migration: Normalize existing semester data to short format
-- Created: 2026-07-17
-- Purpose: Convert long-format semester codes (2025-1, 2025-2) to short format (F25, S25)

-- Normalize profiles.current_semester from long format to short format
update public.profiles
set current_semester = case
  when current_semester = '2025-1' then 'F25'
  when current_semester = '2025-2' then 'S25'
  when current_semester = '2026-1' then 'F26'
  when current_semester = '2026-2' then 'S26'
  when current_semester ~ '^\d{4}-\d$' then
    'F' || right(current_semester, 2)
  else current_semester
end
where current_semester is not null
  and current_semester ~ '^\d{4}-[12]$';

-- Normalize extracted_courses.semester_code
update public.extracted_courses
set semester_code = case
  when semester_code = '2025-1' then 'F25'
  when semester_code = '2025-2' then 'S25'
  when semester_code = '2026-1' then 'F26'
  when semester_code = '2026-2' then 'S26'
  else semester_code
end
where semester_code is not null
  and semester_code ~ '^\d{4}-[12]$';

-- Normalize discovered_courses.semester_code
update public.discovered_courses
set semester_code = case
  when semester_code = '2025-1' then 'F25'
  when semester_code = '2025-2' then 'S25'
  when semester_code = '2026-1' then 'F26'
  when semester_code = '2026-2' then 'S26'
  else semester_code
end
where semester_code is not null
  and semester_code ~ '^\d{4}-[12]$';
