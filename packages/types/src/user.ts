export interface User {
  id: string
  email: string
  username: string
  is_admin: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Profile extends User {
  display_name: string
  first_name?: string
  last_name?: string
  avatar_url?: string | null
}
