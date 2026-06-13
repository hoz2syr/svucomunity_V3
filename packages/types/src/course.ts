export interface Course {
  id: string
  code: string
  name: string
  name_ar: string | null
  major: string
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}
