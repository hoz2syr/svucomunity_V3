import { iteData } from '../data/ite_data';
import type { Course, SpecializationCourse, SpecializationId, CourseCode } from '../types';

const courseCache = new Map<CourseCode, Course | SpecializationCourse>();
const coursesByPrereq = new Map<CourseCode, CourseCode[]>();
const MAX_AVAILABLE_DEPTH = 50;

const addPrereqEntry = (code: CourseCode, prereq: CourseCode) => {
  const existing = coursesByPrereq.get(prereq) ?? [];
  if (!existing.includes(code)) {
    existing.push(code);
    coursesByPrereq.set(prereq, existing);
  }
};

const populateCourseCache = (): void => {
  courseCache.clear();

  Object.values(iteData.courses).forEach((c) => {
    courseCache.set(c.code, c as Course);
  });

  Object.values(iteData.specialization_courses).forEach((spec) => {
    Object.values(spec.tracks).forEach((track) => {
      Object.values(track.courses).forEach((c) => {
        courseCache.set(c.code, c as SpecializationCourse);
      });
    });
  });
};

const buildSupportingIndexes = (): void => {
  populateCourseCache();
  coursesByPrereq.clear();

  Object.values(iteData.courses).forEach((c) => {
    const course = c as Course;
    course.prereqs.forEach((p) => addPrereqEntry(course.code, p));
  });

  Object.values(iteData.specialization_courses).forEach((spec) => {
    Object.values(spec.tracks).forEach((track) => {
      Object.values(track.courses).forEach((c) => {
        const course = c as SpecializationCourse;
        course.prereqs.forEach((p) => addPrereqEntry(course.code, p));
      });
    });
  });
};

buildSupportingIndexes();

export const getCourseDetails = (code: string): Course | SpecializationCourse | undefined => {
  return courseCache.get(code);
};

// Cache core courses list to avoid repeated Object.values
const coreCourses = Object.values(iteData.courses) as Course[];
const allSpecCourses: SpecializationCourse[] = [];
Object.values(iteData.specialization_courses).forEach((spec) => {
  Object.values(spec.tracks).forEach((track) => {
    Object.values(track.courses).forEach((c) => {
      allSpecCourses.push(c as SpecializationCourse);
    });
  });
});

const SPEC_CODES_BY_SPEC = new Map<SpecializationId, Set<CourseCode>>();
Object.values(iteData.specialization_courses).forEach((spec) => {
  const codes = new Set<CourseCode>();
  Object.values(spec.tracks).forEach((track) => {
    Object.values(track.courses).forEach((c) => {
      codes.add(c.code);
    });
  });
  SPEC_CODES_BY_SPEC.set(spec.id, codes);
});

export const getDirectPrereqs = (code: CourseCode): CourseCode[] => {
  const course = getCourseDetails(code);
  return course?.prereqs ?? [];
};

export const getSuccessors = (code: CourseCode, specializationId: SpecializationId | null = null): CourseCode[] => {
  const raw = coursesByPrereq.get(code) ?? [];
  if (!specializationId) {
    return [...raw];
  }

  const allowed = SPEC_CODES_BY_SPEC.get(specializationId);
  if (!allowed) {
    return [];
  }

  return raw.filter((s) => allowed.has(s));
};

export const calculateStudentStatus = (passedCourses: string[]) => {
  let totalCredits = 0;

  passedCourses.forEach((code) => {
    const course = getCourseDetails(code);
    if (course) {
      totalCredits += course.credits;
    }
  });

  let currentYear = 1;
  const promotionThresholds = [...iteData.meta.rules.promotion_thresholds].sort((a, b) => a.min_credits - b.min_credits);
  for (const threshold of promotionThresholds) {
    if (totalCredits >= threshold.min_credits) {
      currentYear = threshold.year;
    }
  }

  return { totalCredits, currentYear };
};

const isCourseAvailable = (allPassed: Set<CourseCode>, course: Course | SpecializationCourse, depth: number): boolean => {
  if (allPassed.has(course.code)) return false;
  if (course.prereqs.length === 0) return true;

  if (depth > MAX_AVAILABLE_DEPTH) {
    return false;
  }

  return course.prereqs.every((prereqCode) => {
    const prereq = getCourseDetails(prereqCode);
    if (!prereq) return false;
    if (allPassed.has(prereqCode)) return true;
    return isCourseAvailable(allPassed, prereq, depth + 1);
  });
};

export const getAvailableCourses = (passedCourses: string[]): CourseCode[] => {
  const available: CourseCode[] = [];
  const passedSet = new Set<CourseCode>(passedCourses);

  coreCourses.forEach((course) => {
    if (isCourseAvailable(passedSet, course, 0)) {
      available.push(course.code);
    }
  });

  allSpecCourses.forEach((course) => {
    if (isCourseAvailable(passedSet, course, 0)) {
      available.push(course.code);
    }
  });

  return available;
};
