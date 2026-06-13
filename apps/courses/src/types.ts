/**
 * ════════════════════════════════════════════════════════════════
 * أنواع البيانات — تطبيق المقررات
 * يتطابق مع supabase/migrations/004_courses.sql و 006_resources.sql
 * ════════════════════════════════════════════════════════════════
 */

export type CourseResourceType = 'PDF' | 'فيديو' | 'رابط' | 'كود' | 'شرائح';

export type SupabaseCourse = {
  id:          string;   // UUID
  code:        string;   // unique, e.g. "BMA401"
  name:        string;   // English name
  name_ar:     string | null;
  major:       string;
  description: string | null;
  credits:     number;   // الساعات المعتمدة
  semester:    number;   // رقم الفصل الدراسي
  is_active:   boolean;
  created_at:  string;   // ISO 8601
};

export type SupabaseResource = {
  id:            string;   // UUID
  course_id:     string;   // UUID FK → courses.id
  course_code:   string;   // denormalised for convenience
  course_name:   string;
  major:         string;
  title:         string;
  url:           string;
  description:   string | null;
  resource_type: CourseResourceType;
  uploader_id:   string | null;
  uploader_name: string;
  votes:         number;   // CHECK >= 0
  is_active:     boolean;
  created_at:    string;
};
