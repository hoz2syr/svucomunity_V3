/**
 * ════════════════════════════════════════════════════════════════
 * useCoursesApp — يجمع كل حالة (state) ومنطق تطبيق المقررات
 * يلخص الاستعلامات والتصفية والتبويبات في hook واحد
 * ════════════════════════════════════════════════════════════════
 */
import { useState, useCallback, useMemo } from 'react';
import { useCourses, type Course } from './useCourses';

const ALL_MAJORS = 'جميع التخصصات';

type ActiveTab = 'courses' | 'map';

export interface CoursesAppState {
  activeTab: ActiveTab;
  selectedMajor: string;
  selectedCourse: Course | null;
}

export interface CoursesAppActions {
  setActiveTab: (tab: ActiveTab) => void;
  setSelectedMajor: (major: string) => void;
  setSelectedCourse: (course: Course | null) => void;
  refetchCourses: () => void;
}

export interface CoursesAppResult {
  state: CoursesAppState;
  actions: CoursesAppActions;
  filteredCourses: Course[];
  courses: Course[];
  majors: string[];
  loading: boolean;
  error: string | null;
  courseStats: { total: number; filtered: number };
}

export function useCoursesApp(): CoursesAppResult {
  const { courses, majors, loading, error, refetch: refetchCourses } = useCourses();

  const [activeTab, setActiveTab] = useState<ActiveTab>('courses');
  const [selectedMajor, setSelectedMajor] = useState(ALL_MAJORS);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const filteredCourses = useMemo(
    () =>
      selectedMajor === ALL_MAJORS
        ? courses
        : courses.filter((course) => course.major === selectedMajor),
    [courses, selectedMajor]
  );

  const courseStats = useMemo(
    () => ({
      total: courses.length,
      filtered: filteredCourses.length,
    }),
    [courses.length, filteredCourses.length]
  );

  const state: CoursesAppState = {
    activeTab,
    selectedMajor,
    selectedCourse,
  };

  const actions: CoursesAppActions = {
    setActiveTab,
    setSelectedMajor,
    setSelectedCourse,
    refetchCourses,
  };

  return {
    state,
    actions,
    filteredCourses,
    courses,
    majors,
    loading,
    error,
    courseStats,
  };
}
