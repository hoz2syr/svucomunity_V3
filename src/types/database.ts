export type Json =
  | string
  | number
  | boolean
  | null
  | Json[]
  | { [key: string]: Json | undefined };

export type Timestamp = string;

export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  email: string | null;
  username: string | null;
  role: string | null;
  provider: string | null;
  provider_id: string | null;
  major: string | null;
  current_semester: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
};

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  read: boolean;
  type: string;
  created_by: string | null;
  priority: string;
  created_at: Timestamp;
};

export type AdminAuditLog = {
  id: string;
  caller_id: string;
  action: string;
  payload: Json;
  ip_address: string;
  user_agent: string;
  created_at: Timestamp;
};

export type Test = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  settings: Json;
  questions: Json;
  rating: number | null;
  rating_count: number | null;
  published: boolean;
  major: string | null;
  course_code: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
};

export type TestRating = {
  id: string;
  test_id: string;
  user_id: string;
  rating: number;
};

export type TestAttempt = {
  id: string;
  test_id: string;
  user_id: string | null;
  score: number;
  total: number;
  answers: Json;
  completed_at: Timestamp;
};

export type Group = {
  id: string;
  name: string;
  course_name: string;
  course_code: string;
  class_number: string | null;
  doctor_name: string | null;
  major: string;
  max_members: number;
  current_members: number;
  whatsapp_link: string;
  group_link: string | null;
  is_full: boolean;
  creator_id: string;
  creator_name: string;
  created_at: Timestamp;
  updated_at: Timestamp;
};

export type GroupMember = {
  id: string;
  group_id: string;
  user_id: string;
  joined_at: Timestamp;
};

export type SubjectReference = {
  id: string;
  course_code: string;
  user_id: string;
  type: 'video' | 'reference' | 'link';
  title: string;
  url: string;
  description: string | null;
  created_at: Timestamp;
};

export type UserCourseProgress = {
  user_id: string;
  course_code: string;
  status: 'passed' | 'carried';
  updated_at: Timestamp;
};

export type UserCourseProgressInsert = {
  user_id?: string;
  course_code: string;
  status: 'passed' | 'carried';
};

export type RawExtraction = {
  id: string;
  user_id: string;
  raw_markdown: string;
  detected_schema: Json;
  created_at: Timestamp;
};

export type ExtractedCourseRecord = {
  id: string;
  extraction_id: string;
  course_name: string;
  semester_code: string;
  full_code: string;
  instructor_name: string | null;
  instructor_username: string | null;
  major: string;
  course_key: string;
  section: string | null;
  semester_year: string;
  discovered_course_code: string | null;
  discovered_instructor_username: string | null;
  created_at: Timestamp;
};

export type DiscoveredCourse = {
  course_code: string;
  major: string;
  course_key: string;
  course_name: string;
  section: string | null;
  semester_code: string;
  seen_count: number;
  first_seen_at: Timestamp;
  last_seen_at: Timestamp;
  is_verified: boolean;
  verified_at: Timestamp | null;
  verified_by: string | null;
};

export type DiscoveredInstructor = {
  instructor_username: string;
  full_name: string;
  seen_count: number;
  first_seen_at: Timestamp;
  last_seen_at: Timestamp;
  is_verified: boolean;
  verified_at: Timestamp | null;
  verified_by: string | null;
};

export type DiscoveredMajor = {
  major_code: string;
  major_name_ar: string | null;
  major_name_en: string | null;
  seen_count: number;
  first_seen_at: Timestamp;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id' | 'created_at'> & { user_id: string };
        Update: Partial<Omit<Notification, 'id' | 'user_id' | 'created_at'>>;
      };
      admin_audit_log: {
        Row: AdminAuditLog;
        Insert: Omit<AdminAuditLog, 'id' | 'created_at'>;
        Update: Partial<Omit<AdminAuditLog, 'id' | 'created_at'>>;
      };
      tests: {
        Row: Test;
        Insert: Omit<Test, 'id' | 'created_at' | 'updated_at'> & { user_id: string };
        Update: Partial<Omit<Test, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
      };
      test_ratings: {
        Row: TestRating;
        Insert: Omit<TestRating, 'id'>;
        Update: Partial<Omit<TestRating, 'id'>>;
      };
      test_attempts: {
        Row: TestAttempt;
        Insert: Omit<TestAttempt, 'id' | 'completed_at'>;
        Update: Partial<Omit<TestAttempt, 'id' | 'completed_at'>>;
      };
      groups: {
        Row: Group;
        Insert: Omit<Group, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Group, 'id' | 'created_at' | 'updated_at'>>;
      };
      group_members: {
        Row: GroupMember;
        Insert: Omit<GroupMember, 'id' | 'joined_at'>;
        Update: Partial<Omit<GroupMember, 'id' | 'joined_at'>>;
      };
      subject_references: {
        Row: SubjectReference;
        Insert: Omit<SubjectReference, 'id' | 'created_at'> & { user_id: string };
        Update: Partial<Omit<SubjectReference, 'id' | 'user_id' | 'created_at'>>;
      };
      user_course_progress: {
        Row: UserCourseProgress;
        Insert: Omit<UserCourseProgress, 'updated_at'> & { user_id: string };
        Update: Partial<Omit<UserCourseProgress, 'user_id' | 'course_code'>>;
      };
      raw_extractions: {
        Row: RawExtraction;
        Insert: Omit<RawExtraction, 'id' | 'created_at'> & { user_id: string };
        Update: Partial<Omit<RawExtraction, 'id' | 'user_id' | 'created_at'>>;
      };
      extracted_courses: {
        Row: ExtractedCourseRecord;
        Insert: Omit<ExtractedCourseRecord, 'id' | 'created_at'> & {
          extraction_id: string;
        };
        Update: Partial<Omit<ExtractedCourseRecord, 'id' | 'extraction_id' | 'created_at'>>;
      };
      discovered_courses: {
        Row: DiscoveredCourse;
        Insert: Omit<DiscoveredCourse, 'first_seen_at' | 'last_seen_at'> & {
          course_code: string;
        };
        Update: Partial<Omit<DiscoveredCourse, 'course_code'>>;
      };
      discovered_instructors: {
        Row: DiscoveredInstructor;
        Insert: Omit<DiscoveredInstructor, 'first_seen_at' | 'last_seen_at'> & {
          instructor_username: string;
        };
        Update: Partial<Omit<DiscoveredInstructor, 'instructor_username'>>;
      };
      discovered_majors: {
        Row: DiscoveredMajor;
        Insert: Omit<DiscoveredMajor, 'first_seen_at'> & { major_code: string };
        Update: Partial<Omit<DiscoveredMajor, 'major_code'>>;
      };
    };
  };
};
