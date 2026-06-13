/**
 * ════════════════════════════════════════════════════════════════
 * أنواع البيانات — تطبيق الجدول
 * يستخدم @svu-community/types للمستخدمين
 * ════════════════════════════════════════════════════════════════
 */

/** Represents a course with its basic details */
export interface Course {
  /** Short course code (e.g. `CS101`) */
  code: string;
  /** Full course title */
  name: string;
  /** Optional section identifier */
  section?: string;
  /** Course instructor name */
  instructor?: string;
  /** Class time string */
  time?: string;
}

/**
 * Raw row shape of the `study_groups` table as returned by Supabase.
 *
 * Uses snake_case to mirror the underlying database columns so that the
 * generic `Database` type inference works without manual mapping.
 */
export interface StudyGroup {
  /** Unique identifier for the study group */
  id: string;
  /** Course code the group belongs to */
  course_code: string;
  /** Full name of the course */
  course_name: string;
  /** Display name of the study group */
  name: string;
  /** Optional description of the group */
  description?: string;
  /** User ID of the group creator */
  creator_id: string;
  /** Array of member user IDs currently in the group */
  members: string[];
  /** ISO timestamp of when the group was created */
  created_at: string;
}

/**
 * Payload shape used when inserting a new row into `study_groups`.
 *
 * Omits server-managed columns (`id`, `created_at`) and uses the raw
 * snake_case column names so it can be passed directly to
 * `supabase.from('study_groups').insert(...)`.
 */
export interface CreateGroupInput {
  /** Course code the group belongs to */
  course_code: string;
  /** Full name of the course */
  course_name: string;
  /** Display name of the study group */
  name: string;
  /** User ID of the group creator */
  creator_id: string;
  /** Initial members of the group (at minimum the creator) */
  members: string[];
}

/**
 * Payload shape used when updating an existing row in `study_groups`.
 *
 * All fields are optional because Supabase `.update()` accepts partial
 * objects. Uses raw snake_case column names.
 */
export interface UpdateGroupInput {
  /** Updated display name of the study group */
  name?: string;
  /** Updated description of the group */
  description?: string;
  /** Updated array of member user IDs */
  members?: string[];
}

/**
 * Result returned by the schedule extraction service.
 */
export interface ExtractionResult {
  major: string;
  courses: Course[];
}

/**
 * Supabase Database type augmenting the generated `Database` interface
 * with the `study_groups` table schema used across the schedule app.
 *
 * Import this type as the generic argument to typed Supabase clients
 * to avoid `any` inference on query results.
 */
export type Database = {
  public: {
    Tables: {
      study_groups: {
        Row: StudyGroup;
        Insert: Omit<StudyGroup, 'id' | 'created_at'>;
        Update: Partial<Omit<StudyGroup, 'id' | 'created_at' | 'creator_id'>>;
      };
    };
  };
};
