export interface BaseCourse {
  code: string;
  name_ar: string;
  credits: number;
  prereqs: string[];
}

export interface Course extends BaseCourse {
  year: number;
  type: CourseType;
  english_must_pass?: boolean;
}

export interface SpecializationCourse extends BaseCourse {
}

export type TrackId = string;
export type CourseCode = string;
export type SpecializationId = string;

export interface Track {
  id: TrackId;
  name_ar: string;
  courses: Record<CourseCode, SpecializationCourse>;
}

export interface Specialization {
  id: SpecializationId;
  name_ar: string;
  prereqs_from_core: CourseCode[];
  tracks: Record<TrackId, Track>;
}

export type CourseState = 'locked' | 'available' | 'passed';
