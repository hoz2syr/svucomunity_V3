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
  created_at: Timestamp;
  updated_at: Timestamp;
};

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  read: boolean;
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
    };
  };
};
