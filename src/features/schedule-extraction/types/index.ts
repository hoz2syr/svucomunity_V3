export interface ExtractedCourse {
  code: string;
  name: string;
  section: string | null;
  instructor: string | null;
  instructor_username: string | null;
  time: string | null;
  major: string | null;
  course_key: string | null;
  semester: string | null;
}

export interface ScheduleExtractionResult {
  major: string;
  courses: ExtractedCourse[];
}

export interface MatchedGroup {
  id: string;
  name: string;
  course_code: string;
  course_name: string;
  major: string;
  class_number?: string | null;
  current_members: number;
  max_members: number;
  is_full: boolean;
  creator_name: string;
  creator_id?: string;
  whatsapp_link: string | null;
  group_link?: string | null;
  matchScore?: number;
  matchReasons?: string[];
}

export interface DraftGroup {
  id: string;
  course_code: string;
  course_name: string;
  name: string;
  major: string;
  class_number?: string | null;
  instructor?: string | null;
  max_members: number;
  whatsapp_link?: string | null;
  group_link?: string | null;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface MatchResult {
  matched: MatchedGroup[];
  unmatched: ExtractedCourse[];
}

export type CourseStatus = 'new' | 'passed' | 'carried' | 'failed';

export interface MatchedCourseWithStatus {
  code: string;
  name: string;
  section: string | null;
  major: string | null;
  status: CourseStatus;
  matchScore?: number;
  matchReasons?: string[];
  matchedGroups: MatchedGroup[];
}

export interface StudyGroupSuggestion {
  group: MatchedGroup;
  relevanceScore: number;
  matchedCourseCodes: string[];
  reasons: string[];
}
