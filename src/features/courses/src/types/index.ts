export interface CourseInfo {
  over: string;
  doc: string;
  prac: string;
  exam: string;
}

export interface Course {
  name: string;
  credits: number;
  level: number | 'ENG';
  prereqs: string[];
  diff: 1 | 2 | 3;
  info?: CourseInfo;
  isEnglish?: boolean;
  earned?: number;
  minTotalCredits?: number;
  icon?: string;
}

export type CourseStatus = 'locked' | 'available' | 'selected' | 'passed' | 'carried';

export interface CourseNode extends Course {
  id: string;
  status: CourseStatus;
}

export type PromotionThreshold = {
  name: string;
  credits: number;
};
