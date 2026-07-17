export interface StudyGroup {
  id: string;
  name: string;
  course_name: string;
  course_code: string;
  class_number?: string;
  doctor_name?: string;
  major: string;
  max_members: number;
  current_members: number;
  whatsapp_link: string;
  group_link?: string;
  is_full?: boolean;
  creator_id: string;
  creator_name: string;
  created_at: string;
  updated_at?: string;
  semester_code: string;
  is_archived: boolean;
  _creatorFullName?: string;
  _creatorUsername?: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  joined_at: string;
}

export interface StudyGroupFilters {
  search: string;
  major: string;
  course_code: string;
  class_number: string;
  status: 'all' | 'available' | 'full';
}

export interface CreateGroupData {
  name: string;
  course_name: string;
  course_code: string;
  class_number: string;
  doctor_name: string;
  major: string;
  max_members: number;
  whatsapp_link: string;
  group_link?: string;
}

export interface UpdateGroupData {
  name?: string;
  course_name?: string;
  course_code?: string;
  class_number?: string;
  doctor_name?: string;
  major?: string;
  max_members?: number;
  whatsapp_link?: string;
  group_link?: string;
}

export interface Course {
  code: string;
  name: string;
}

export type StudyGroupStatus = 'loading' | 'success' | 'error' | 'empty';
