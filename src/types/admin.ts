export type ServiceResult<T> = { data: T | null; error: Error | null };

export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  STUDENT: 'student',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export type RawExtractionDetail = {
  id: string;
  created_at: string;
  detected_schema: Record<string, unknown>;
  course_count: number;
};
