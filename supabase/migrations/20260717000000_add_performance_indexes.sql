-- Add performance indexes for frequently queried tables

-- tests: common filter patterns by publication status
create index if not exists idx_tests_published_created_at
  on public.tests (published, created_at desc)
  where published = true;

-- tests: combined major + published filter
create index if not exists idx_tests_major_published
  on public.tests (major, published)
  where major is not null and published = true;

-- test_attempts: user's attempt history ordered by recency
create index if not exists idx_test_attempts_user_id_test_id
  on public.test_attempts (user_id, test_id, created_at desc);

-- test_attempts: global recent attempts for admin/analytics queries
create index if not exists idx_test_attempts_created_at
  on public.test_attempts (created_at desc);

-- group_members: membership lookups
create index if not exists idx_group_members_user_id_group_id
  on public.group_members (user_id, group_id);

comment on index public.idx_tests_published_created_at is
  'Optimizes fetching published tests by recency';
comment on index public.idx_tests_major_published is
  'Optimizes major + published filtered test queries';
comment on index public.idx_test_attempts_user_id_test_id is
  'Optimizes user attempt history per test';
comment on index public.idx_test_attempts_created_at is
  'Optimizes recent attempts analytics queries';
comment on index public.idx_group_members_user_id_group_id is
  'Optimizes study group membership lookups';

