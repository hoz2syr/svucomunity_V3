export type ReferenceType = 'video' | 'reference' | 'link';

export interface SubjectReference {
  id: string;
  course_code: string;
  user_id: string;
  type: ReferenceType;
  title: string;
  url: string;
  description?: string;
  created_at: string;
}

export interface SubjectReferenceInsert {
  course_code: string;
  type: ReferenceType;
  title: string;
  url: string;
  description?: string;
}

export interface UserCourseProgress {
  user_id: string;
  course_code: string;
  status: 'passed' | 'carried';
  updated_at: string;
}

export interface UserCourseProgressInsert {
  course_code: string;
  status: 'passed' | 'carried';
}

export type SubjectTab = 'info' | 'references' | 'tests' | 'groups';

export interface Subject {
  id: string;
  name: string;
  credits: number;
  level: number | 'ENG';
  prereqs: string[];
  diff: 1 | 2 | 3;
  info?: {
    over: string;
    doc: string;
    prac: string;
    exam: string;
  };
  isEnglish?: boolean;
  earned?: number;
  minTotalCredits?: number;
  icon?: string;
}
