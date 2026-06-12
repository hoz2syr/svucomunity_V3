export interface Course {
  id: string
  code: string
  name: string
  name_ar: string | null
  title_ar?: string
  title_en?: string
  major: string
  description: string | null
  instructor?: string
  credits?: number
  semester?: string
  year?: number
  image_url?: string
  is_active: boolean
  created_at: string
}
