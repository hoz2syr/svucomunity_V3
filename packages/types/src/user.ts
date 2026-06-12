export interface User {
  id: string
  email: string
  username: string
  first_name: string
  last_name: string
  major: string
  phone: string
  country: string
  avatar_url?: string
  display_name?: string
  is_admin: boolean
  created_at: string
}
