import { randomUUID } from 'crypto';

const COURSES = [
  { code: 'CS101', name: 'Introduction to Computer Science', major: 'CS', key: 'cs101' },
  { code: 'CS102', name: 'Programming Fundamentals', major: 'CS', key: 'cs102' },
  { code: 'CS201', name: 'Data Structures', major: 'CS', key: 'cs201' },
  { code: 'CS202', name: 'Algorithms', major: 'CS', key: 'cs202' },
  { code: 'CS301', name: 'Database Systems', major: 'CS', key: 'cs301' },
  { code: 'CS302', name: 'Operating Systems', major: 'CS', key: 'cs302' },
  { code: 'CS401', name: 'Software Engineering', major: 'CS', key: 'cs401' },
  { code: 'CS402', name: 'Computer Networks', major: 'CS', key: 'cs402' },
  { code: 'IS101', name: 'Introduction to Information Systems', major: 'IS', key: 'is101' },
  { code: 'IS102', name: 'Business Programming', major: 'IS', key: 'is102' },
  { code: 'IS201', name: 'Systems Analysis & Design', major: 'IS', key: 'is201' },
  { code: 'IS202', name: 'Database Management', major: 'IS', key: 'is202' },
  { code: 'IT101', name: 'IT Fundamentals', major: 'IT', key: 'it101' },
  { code: 'IT201', name: 'Web Technologies', major: 'IT', key: 'it201' },
  { code: 'AI301', name: 'Machine Learning Basics', major: 'AI', key: 'ai301' },
  { code: 'DS201', name: 'Statistics for Data Science', major: 'DS', key: 'ds201' },
];

const MAJORS = [
  { code: 'CS', nameAr: 'علوم الحاسب', nameEn: 'Computer Science' },
  { code: 'IS', nameAr: 'نظم المعلومات', nameEn: 'Information Systems' },
  { code: 'IT', nameAr: 'تكنولوجيا المعلومات', nameEn: 'Information Technology' },
  { code: 'AI', nameAr: 'الذكاء الاصطناعي', nameEn: 'Artificial Intelligence' },
  { code: 'DS', nameAr: 'علم البيانات', nameEn: 'Data Science' },
  { code: 'CY', nameAr: 'الأمن السيبراني', nameEn: 'Cybersecurity' },
  { code: 'SE', nameAr: 'هندسة البرمجيات', nameEn: 'Software Engineering' },
];

const INSTRUCTORS = [
  { username: 'dr_mahmoud', name: 'د. Mahmoud Abdel Rahman', verified: true },
  { username: 'dr_salah', name: 'د. Salah Ali', verified: true },
  { username: 'dr_nadia', name: 'د. Nadia Hassan', verified: true },
  { username: 'dr_karim', name: 'د. Karim Farid', verified: true },
  { username: 'dr_hesham', name: 'د. Hisham Nabil', verified: false },
  { username: 'dr_mona', name: 'د. Mona Tariq', verified: true },
  { username: 'dr_amr', name: 'د. Amr Samir', verified: false },
  { username: 'dr_rana', name: 'د. Rana Adel', verified: true },
  { username: 'dr_khaled', name: 'د. Khaled Mostafa', verified: false },
  { username: 'dr_samia', name: 'د. Samia Youssef', verified: true },
];

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function generateUsers(count) {
  const lines = [];
  const baseId = 10000000;
  for (let i = 0; i < count; i++) {
    const id = `00000000-0000-0000-0000-${(baseId + i).toString(16).padStart(12, '0')}`;
    const email = `student${i + 1}@svu.edu`;
    const fullName = `Student ${i + 1}`;
    const major = MAJORS[i % MAJORS.length].code;
    const semester = ['2026-1', '2026-2', '2025-1', '2025-2'][i % 4];
    lines.push(`  ('${id}', '${email}', crypt('password123', gen_salt('bf', 10)), now(), NULL, NULL, NULL, NULL, now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"${fullName}"}'::jsonb, false, NULL, NULL, true, '127.0.0.1', '127.0.0.1', NULL)`);
  }
  return lines.join(',\n');
}

function generateProfiles(count) {
  const lines = [];
  const baseId = 10000000;
  for (let i = 0; i < count; i++) {
    const id = `00000000-0000-0000-0000-${(baseId + i).toString(16).padStart(12, '0')}`;
    const email = `student${i + 1}@svu.edu`;
    const fullName = `Student ${i + 1}`;
    const major = MAJORS[i % MAJORS.length].code;
    const semester = ['2026-1', '2026-2', '2025-1', '2025-2'][i % 4];
    lines.push(`  ('${id}', '${fullName}', 'https://api.dicebear.com/7.x/avataaars/svg?seed=student${i + 1}', '+2010000${(1000 + i).toString().padStart(4, '0')}', '${email}', 'student_${i + 1}', 'student', 'email', NULL, '${major}', '${semester}', now() - interval '${i + 1} days', now())`);
  }
  return lines.join(',\n');
}

function generateDiscoveredMajors() {
  return MAJORS.map(m => `  ('${m.code}', '${m.nameAr}', '${m.nameEn}', ${Math.floor(Math.random() * 20) + 1}, now() - interval '${Math.floor(Math.random() * 90) + 10} days', now())`).join(',\n');
}

function generateDiscoveredInstructors() {
  return INSTRUCTORS.map((inst, i) => `  ('${inst.username}', '${inst.name}', ${Math.floor(Math.random() * 20) + 1}, now() - interval '${Math.floor(Math.random() * 90) + 10} days', now(), ${inst.verified}, now(), '11111111-1111-1111-1111-111111111111')`).join(',\n');
}

function generateDiscoveredCourses() {
  const lines = [];
  const semesters = ['2026-1', '2026-2', '2025-1', '2025-2'];
  for (let i = 0; i < 50; i++) {
    const course = COURSES[i % COURSES.length];
    const section = String.fromCharCode(65 + (i % 5));
    const semester = semesters[i % 4];
    const seenCount = Math.floor(Math.random() * 30) + 1;
    const isVerified = i < 30;
    lines.push(`  ('${course.code}${i >= COURSES.length ? (Math.floor(i / COURSES.length) + 1) : ''}', '${course.major}', '${course.key}${i >= COURSES.length ? (Math.floor(i / COURSES.length) + 1) : ''}', '${course.name}', '${section}', '${semester}', ${seenCount}, now() - interval '${Math.floor(Math.random() * 90) + 10} days', now(), ${isVerified}, now(), '11111111-1111-1111-1111-111111111111')`);
  }
  return lines.join(',\n');
}

function generateUserCourseProgress(userCount) {
  const lines = [];
  const baseId = 10000000;
  for (let i = 0; i < userCount; i++) {
    const userId = `00000000-0000-0000-0000-${(baseId + i).toString(16).padStart(12, '0')}`;
    const numCourses = 3 + (i % 4);
    for (let j = 0; j < numCourses; j++) {
      const course = COURSES[(i + j) % COURSES.length];
      const status = Math.random() > 0.3 ? 'passed' : 'carried';
      lines.push(`  ('${userId}', '${course.code}', '${status}', now() - interval '${Math.floor(Math.random() * 30) + 1} days')`);
    }
  }
  return lines.join(',\n');
}

function generateSubjectReferences(userCount) {
  const lines = [];
  const baseId = 10000000;
  const types = ['video', 'reference', 'link'];
  for (let i = 0; i < userCount * 2; i++) {
    const userId = `00000000-0000-0000-0000-${(baseId + (i % userCount)).toString(16).padStart(12, '0')}`;
    const course = COURSES[i % COURSES.length];
    const type = types[i % 3];
    lines.push(`  (gen_random_uuid(), '${course.code}', '${userId}', '${type}', '${course.name} - Reference ${i + 1}', 'https://example.com/${course.key}-ref${i + 1}', 'Reference material for ${course.name}', now() - interval '${Math.floor(Math.random() * 30) + 1} days')`);
  }
  return lines.join(',\n');
}

function generateGroups(userCount) {
  const lines = [];
  const baseId = 10000000;
  for (let i = 0; i < 50; i++) {
    const course = COURSES[i % COURSES.length];
    const groupName = `${course.code} - Group ${String.fromCharCode(65 + (i % 26))}${Math.floor(i / 26) + 1}`;
    const creatorId = `00000000-0000-0000-0000-${(baseId + (i % userCount)).toString(16).padStart(12, '0')}`;
    const maxMembers = 3 + (i % 5);
    const currentMembers = 1 + (i % maxMembers);
    const isFull = currentMembers >= maxMembers;
    lines.push(`  (gen_random_uuid(), '${groupName}', '${course.name}', '${course.code}', '${String.fromCharCode(65 + (i % 26))}${Math.floor(i / 26) + 1}', 'Dr. Instructor ${(i % 10) + 1}', '${course.major}', ${maxMembers}, ${currentMembers}, 'https://chat.whatsapp.com/${course.key.toLowerCase()}${i + 1}', ${isFull ? 'NULL' : `'https://t.me/${course.key.toLowerCase()}${i + 1}'`}, ${isFull}, '${creatorId}', 'Student ${(i % userCount) + 1}', now() - interval '${Math.floor(Math.random() * 30) + 1} days', now())`);
  }
  return lines.join(',\n');
}

function generateGroupMembers(userCount, groupCount) {
  const lines = [];
  const baseId = 10000000;
  for (let i = 0; i < groupCount * 4; i++) {
    const userId = `00000000-0000-0000-0000-${(baseId + (i % userCount)).toString(16).padStart(12, '0')}`;
    const groupIdx = i % groupCount;
    lines.push(`  ('00000000-0000-0000-0000-${(baseId + groupIdx).toString(16).padStart(12, '0')}', '${userId}', now() - interval '${Math.floor(Math.random() * 20) + 1} days')`);
  }
  return lines.join(',\n');
}

function generateTests(userCount) {
  const lines = [];
  const testIds = [];
  for (let i = 0; i < 60; i++) {
    const id = randomUUID();
    testIds.push(id);
    const userId = `00000000-0000-0000-0000-${(10000000 + (i % userCount)).toString(16).padStart(12, '0')}`;
    const course = COURSES[i % COURSES.length];
    const published = i < 45;
    const settings = {
      major: course.major,
      courseCode: course.code,
      courseName: course.name,
      duration: 20 + (i % 5) * 10,
      passingScore: 50 + (i % 3) * 10,
      showAnswers: i % 2 === 0,
      randomizeQuestions: i % 3 === 0,
      attemptsAllowed: 1 + (i % 3),
    };
    const questions = [
      { id: 'q1', text: `Question 1 for ${course.name}`, options: ['A', 'B', 'C', 'D'], correctIndex: 0, points: 2 },
      { id: 'q2', text: `Question 2 for ${course.name}`, options: ['A', 'B', 'C', 'D'], correctIndex: 1, points: 2 },
      { id: 'q3', text: `Question 3 for ${course.name}`, options: ['A', 'B', 'C', 'D'], correctIndex: 2, points: 3 },
    ];
    lines.push(`  ('${id}', '${userId}', '${course.code} - Test ${i + 1}', 'Test description for ${course.name}', '${JSON.stringify(settings).replace(/'/g, "''")}'::jsonb, '[${questions.map(q => `{"id":"${q.id}","text":"${q.text}","options":${JSON.stringify(q.options)},"correctIndex":${q.correctIndex},"points":${q.points}}`).join(',')}]'::jsonb, ${Math.floor(Math.random() * 2) + 3}, ${Math.floor(Math.random() * 5) + 1}, ${published}, '${course.major}', '${course.code}', now() - interval '${Math.floor(Math.random() * 30) + 1} days', now())`);
  }
  return { tests: lines.join(',\n'), testIds };
}

function generateTestRatings(testIds, userCount) {
  const lines = [];
  const baseId = 10000000;
  for (let i = 0; i < testIds.length; i++) {
    const numRatings = 1 + (i % 5);
    for (let j = 0; j < numRatings; j++) {
      const userId = `00000000-0000-0000-0000-${(baseId + ((i + j) % userCount)).toString(16).padStart(12, '0')}`;
      const rating = Math.floor(Math.random() * 2) + 3;
      lines.push(`  ('${testIds[i]}', '${userId}', ${rating}, now() - interval '${Math.floor(Math.random() * 20) + 1} days')`);
    }
  }
  return lines.join(',\n');
}

function generateTestAttempts(testIds, userCount) {
  const lines = [];
  const baseId = 10000000;
  for (let i = 0; i < testIds.length; i++) {
    const numAttempts = 1 + (i % 3);
    for (let j = 0; j < numAttempts; j++) {
      const id = randomUUID();
      const userId = `00000000-0000-0000-0000-${(baseId + ((i + j) % userCount)).toString(16).padStart(12, '0')}`;
      const score = Math.floor(Math.random() * 3) + 2;
      const total = 5;
      lines.push(`  ('${id}', '${testIds[i]}', '${userId}', ${score}, ${total}, '{"q1":"a","q2":"b","q3":"c"}'::jsonb, now() - interval '${Math.floor(Math.random() * 15) + 1} days')`);
    }
  }
  return lines.join(',\n');
}

function generateNotifications(userCount) {
  const lines = [];
  const baseId = 10000000;
  const types = ['exam', 'group', 'reference', 'user', 'admin'];
  const priorities = ['normal', 'high'];
  for (let i = 0; i < 50; i++) {
    const userId = `00000000-0000-0000-0000-${(baseId + (i % userCount)).toString(16).padStart(12, '0')}`;
    const type = types[i % 5];
    const priority = priorities[i % 2];
    const read = i % 3 === 0;
    lines.push(`  (gen_random_uuid(), '${userId}', 'Notification ${i + 1}', 'This is notification body ${i + 1}', ${read}, '${type}', '11111111-1111-1111-1111-111111111111', '${priority}', now() - interval '${Math.floor(Math.random() * 30) + 1} days')`);
  }
  return lines.join(',\n');
}

function generateRawExtractions(adminId) {
  const lines = [];
  for (let i = 0; i < 10; i++) {
    const courses = COURSES.slice(0, 3 + (i % 5)).map(c => `# ${c.code} - ${c.name}\n## Professor: Dr. Instructor ${(i % 10) + 1}\n## Schedule: Sunday, Tuesday 10:00 AM - 11:30 AM\n## Credits: 3`).join('\n\n');
    const detectedSchema = {
      semester: `2026-${(i % 2) + 1}`,
      major: MAJORS[i % MAJORS.length].code,
      courses: COURSES.slice(0, 3 + (i % 5)).map(c => ({ code: c.code, name: c.name, instructor: `Dr. Instructor ${(i % 10) + 1}` })),
    };
    lines.push(`  (gen_random_uuid(), '${adminId}', '${courses.replace(/'/g, "''")}', '${JSON.stringify(detectedSchema).replace(/'/g, "''")}'::jsonb, now() - interval '${Math.floor(Math.random() * 20) + 1} days')`);
  }
  return lines.join(',\n');
}

function generateExtractedCourses(adminId) {
  const lines = [];
  for (let i = 0; i < 20; i++) {
    const course = COURSES[i % COURSES.length];
    const instructor = INSTRUCTORS[i % INSTRUCTORS.length];
    lines.push(`  (gen_random_uuid(), (SELECT id FROM public.raw_extractions WHERE user_id = '${adminId}' LIMIT 1), '${course.name}', '2026-${(i % 2) + 1}', '${course.code}', '${instructor.name}', '${instructor.username}', '${course.major}', '${course.key}', 'A', '2026', '${course.code}', '${instructor.username}', now())`);
  }
  return lines.join(',\n');
}

function generateAdminAuditLog(adminId) {
  const actions = ['user.role_updated', 'test.published', 'course.verified', 'notification.sent', 'extraction.processed'];
  const lines = [];
  for (let i = 0; i < 20; i++) {
    const action = actions[i % actions.length];
    const payload = { target: `item_${i + 1}`, count: Math.floor(Math.random() * 10) + 1 };
    lines.push(`  (gen_random_uuid(), '${adminId}', '${action}', '${JSON.stringify(payload).replace(/'/g, "''")}'::jsonb, '127.0.0.1', 'Mozilla/5.0', now() - interval '${Math.floor(Math.random() * 30) + 1} days')`);
  }
  return lines.join(',\n');
}

function generateRateLimits(userCount) {
  const lines = [];
  const baseId = 10000000;
  for (let i = 0; i < 10; i++) {
    const userId = `00000000-0000-0000-0000-${(baseId + (i % userCount)).toString(16).padStart(12, '0')}`;
    const actions = ['test-creation', 'test-rating', 'group-creation'];
    const action = actions[i % 3];
    lines.push(`  ('${action}:${userId}', ${Math.floor(Math.random() * 10) + 1}, now() + interval '1 minute')`);
  }
  return lines.join(',\n');
}

function generatePlatformReviews(userCount) {
  const lines = [];
  const baseId = 10000000;
  const categories = ['usability', 'performance', 'features', 'support', 'other'];
  const statuses = ['pending', 'approved', 'rejected'];
  for (let i = 0; i < 50; i++) {
    const userId = `00000000-0000-0000-0000-${(baseId + (i % userCount)).toString(16).padStart(12, '0')}`;
    const category = categories[i % 5];
    const status = statuses[i % 3];
    const rating = Math.floor(Math.random() * 3) + 3;
    lines.push(`  (gen_random_uuid(), '${userId}', ${rating}, '${category}', 'Review comment ${i + 1}', '${status}', ${status === 'pending' ? 'NULL' : `'Admin response ${i + 1}'`}, ${status === 'pending' ? 'NULL' : "'11111111-1111-1111-1111-111111111111'"}, ${status === 'pending' ? 'NULL' : 'now()'}, now())`);
  }
  return lines.join(',\n');
}

const USER_COUNT = 90;
const GROUP_COUNT = 50;

const usersBlock = generateUsers(USER_COUNT);
const profilesBlock = generateProfiles(USER_COUNT);
const majorsBlock = generateDiscoveredMajors();
const instructorsBlock = generateDiscoveredInstructors();
const coursesBlock = generateDiscoveredCourses();
const progressBlock = generateUserCourseProgress(USER_COUNT);
const refsBlock = generateSubjectReferences(USER_COUNT);
const groupsBlock = generateGroups(USER_COUNT);
const membersBlock = generateGroupMembers(USER_COUNT, GROUP_COUNT);
const { tests: testsBlock, testIds } = generateTests(USER_COUNT);
const ratingsBlock = generateTestRatings(testIds, USER_COUNT);
const attemptsBlock = generateTestAttempts(testIds, USER_COUNT);
const notificationsBlock = generateNotifications(USER_COUNT);
const rawExtractionsBlock = generateRawExtractions('11111111-1111-1111-1111-111111111111');
const extractedCoursesBlock = generateExtractedCourses('11111111-1111-1111-1111-111111111111');
const auditLogBlock = generateAdminAuditLog('11111111-1111-1111-1111-111111111111');
const rateLimitsBlock = generateRateLimits(USER_COUNT);
const reviewsBlock = generatePlatformReviews(USER_COUNT);

const sql = `-- ============================================================
-- SVU Community — Expanded Seed Data (10x)
-- ============================================================
-- This script adds ~10x more test data on top of 001_seed.sql.
-- Run AFTER 001_seed.sql.
--
-- How to run:
--   1. Start Supabase: supabase start
--   2. Apply migrations: supabase db reset
--   3. Run seed: supabase db execute --file supabase/seed/001_seed.sql
--   4. Run expanded seed: supabase db execute --file supabase/seed/002_expanded_seed.sql
-- ============================================================

-- ============================================================
-- 1. ADDITIONAL AUTH USERS
-- ============================================================
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
${usersBlock}
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. ADDITIONAL PROFILES
-- ============================================================
INSERT INTO public.profiles (
  id, full_name, avatar_url, phone, email, username,
  role, provider, provider_id, major, current_semester,
  created_at, updated_at
) VALUES
${profilesBlock}
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  username = EXCLUDED.username,
  role = EXCLUDED.role,
  major = EXCLUDED.major,
  current_semester = EXCLUDED.current_semester,
  updated_at = now();

-- ============================================================
-- 3. ADDITIONAL DISCOVERED MAJORS
-- ============================================================
INSERT INTO public.discovered_majors (major_code, major_name_ar, major_name_en, seen_count, first_seen_at, last_seen_at)
VALUES
${majorsBlock}
ON CONFLICT (major_code) DO UPDATE SET
  major_name_ar = EXCLUDED.major_name_ar,
  major_name_en = EXCLUDED.major_name_en,
  last_seen_at = now();

-- ============================================================
-- 4. ADDITIONAL DISCOVERED INSTRUCTORS
-- ============================================================
INSERT INTO public.discovered_instructors (instructor_username, full_name, seen_count, first_seen_at, last_seen_at, is_verified, verified_at, verified_by)
VALUES
${instructorsBlock}
ON CONFLICT (instructor_username) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  last_seen_at = now(),
  is_verified = EXCLUDED.is_verified;

-- ============================================================
-- 5. ADDITIONAL DISCOVERED COURSES
-- ============================================================
INSERT INTO public.discovered_courses (
  course_code, major, course_key, course_name, section,
  semester_code, seen_count, first_seen_at, last_seen_at,
  is_verified, verified_at, verified_by
)
VALUES
${coursesBlock}
ON CONFLICT (course_code) DO UPDATE SET
  course_name = EXCLUDED.course_name,
  last_seen_at = now(),
  is_verified = EXCLUDED.is_verified;

-- ============================================================
-- 6. ADDITIONAL USER COURSE PROGRESS
-- ============================================================
INSERT INTO public.user_course_progress (user_id, course_code, status, updated_at)
VALUES
${progressBlock}
ON CONFLICT (user_id, course_code) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = now();

-- ============================================================
-- 7. ADDITIONAL SUBJECT REFERENCES
-- ============================================================
INSERT INTO public.subject_references (id, course_code, user_id, type, title, url, description, created_at)
VALUES
${refsBlock}
ON CONFLICT DO NOTHING;

-- ============================================================
-- 8. ADDITIONAL STUDY GROUPS
-- ============================================================
INSERT INTO public.groups (
  id, name, course_name, course_code, class_number, doctor_name,
  major, max_members, current_members, whatsapp_link, group_link,
  is_full, creator_id, creator_name, created_at, updated_at
)
VALUES
${groupsBlock}
ON CONFLICT DO NOTHING;

-- ============================================================
-- 9. ADDITIONAL GROUP MEMBERS
-- ============================================================
INSERT INTO public.group_members (group_id, user_id, joined_at)
VALUES
${membersBlock}
ON CONFLICT (group_id, user_id) DO NOTHING;

-- Update group member counts
UPDATE public.groups g
SET current_members = (
  SELECT COUNT(*) FROM public.group_members gm WHERE gm.group_id = g.id
);

-- ============================================================
-- 10. ADDITIONAL TESTS
-- ============================================================
INSERT INTO public.tests (
  id, user_id, title, description, settings, questions,
  rating, rating_count, published, major, course_code,
  created_at, updated_at
) VALUES
${testsBlock}
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 11. ADDITIONAL TEST RATINGS
-- ============================================================
INSERT INTO public.test_ratings (test_id, user_id, rating, created_at)
VALUES
${ratingsBlock}
ON CONFLICT (test_id, user_id) DO NOTHING;

-- ============================================================
-- 12. ADDITIONAL TEST ATTEMPTS
-- ============================================================
INSERT INTO public.test_attempts (id, test_id, user_id, score, total, answers, completed_at)
VALUES
${attemptsBlock}
ON CONFLICT DO NOTHING;

-- ============================================================
-- 13. ADDITIONAL NOTIFICATIONS
-- ============================================================
INSERT INTO public.notifications (id, user_id, title, body, read, type, created_by, priority, created_at)
VALUES
${notificationsBlock}
ON CONFLICT DO NOTHING;

-- ============================================================
-- 14. ADDITIONAL RAW EXTRACTIONS
-- ============================================================
INSERT INTO public.raw_extractions (id, user_id, raw_markdown, detected_schema, created_at)
VALUES
${rawExtractionsBlock}
ON CONFLICT DO NOTHING;

-- ============================================================
-- 15. ADDITIONAL EXTRACTED COURSES
-- ============================================================
INSERT INTO public.extracted_courses (id, extraction_id, course_name, semester_code, full_code, instructor_name, instructor_username, major, course_key, section, semester_year, discovered_course_code, discovered_instructor_username, created_at)
VALUES
${extractedCoursesBlock}
ON CONFLICT DO NOTHING;

-- ============================================================
-- 16. ADDITIONAL ADMIN AUDIT LOG
-- ============================================================
INSERT INTO public.admin_audit_log (id, caller_id, action, payload, ip_address, user_agent, created_at)
VALUES
${auditLogBlock}
ON CONFLICT DO NOTHING;

-- ============================================================
-- 17. ADDITIONAL RATE LIMITS
-- ============================================================
INSERT INTO public.rate_limits (key, count, reset_at)
VALUES
${rateLimitsBlock}
ON CONFLICT (key) DO UPDATE SET count = EXCLUDED.count, reset_at = EXCLUDED.reset_at;

-- ============================================================
-- 18. ADDITIONAL PLATFORM REVIEWS
-- ============================================================
INSERT INTO public.platform_reviews (id, user_id, rating, category, comment, status, admin_response, responded_by, responded_at, created_at)
VALUES
${reviewsBlock}
ON CONFLICT DO NOTHING;

-- ============================================================
-- Expanded Seed Complete!
-- ============================================================
`;

console.log(sql);
