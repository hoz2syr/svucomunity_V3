export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'user' | 'admin';
}

export interface Course {
  id: string;
  title: string;
  code: string;
}
export interface Group {
  id: string;
  name: string;
  courseId: string;
}
