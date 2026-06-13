export interface User {
  id: string;
  email: string;
  username?: string;
  name?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  major?: string;
  avatar_url?: string;
  phone?: string;
  is_admin?: boolean;
  is_active?: boolean;
  role?: 'user' | 'admin';
}

export interface Course {
  id: string;
  title: string;
  name?: string;
  code: string;
  description?: string;
  path?: string;
  major?: string;
  semester?: string;
}

export interface Group {
  id: string;
  name: string;
  courseId?: string;
  description?: string;
  memberCount?: number;
}
