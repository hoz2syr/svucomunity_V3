import { iteData } from '@/components/interactive-map/data/ite_data';
import type { Course, SpecializationCourse } from '@/components/interactive-map/types';

/**
 * Builds lookup indices for courses and their prerequisite → successor relationships.
 * Called automatically at module load time.
 */
function buildIndices() {
  Object.values(iteData.courses).forEach((course) => {
    allCourses.set(course.code, course as Course);
    course.prereqs.forEach((prereq) => {
      if (!prereqToSuccessors.has(prereq)) prereqToSuccessors.set(prereq, new Set());
      prereqToSuccessors.get(prereq)!.add(course.code);
    });
  });

  Object.values(iteData.specialization_courses).forEach((spec) => {
    Object.values(spec.tracks).forEach((track) => {
      Object.values(track.courses).forEach((course) => {
        allCourses.set(course.code, course as SpecializationCourse);
        course.prereqs.forEach((prereq) => {
          if (!prereqToSuccessors.has(prereq)) prereqToSuccessors.set(prereq, new Set());
          prereqToSuccessors.get(prereq)!.add(course.code);
        });
      });
    });
  });
}

buildIndices();

/**
 * Finds specialization courses that list the given code as a prerequisite.
 * @param code - Prerequisite course code to search for
 * @param specializationId - Optional specialization filter (e.g. "AI", "SE", "SCN")
 * @returns Deduplicated list of successor course codes
 */
function findInSpecializations(code: string, specializationId?: string): string[] {
  const specs = specializationId
    ? iteData.specialization_courses[specializationId]
      ? [iteData.specialization_courses[specializationId]]
      : []
    : Object.values(iteData.specialization_courses);

  const results = specs.flatMap((spec) =>
    Object.values(spec.tracks).flatMap((track) =>
      Object.values(track.courses)
        .filter((course) => course.prereqs.includes(code))
        .map((course) => course.code)
    )
  );

  return [...new Set(results)];
}

/**
 * Retrieves full course details by course code.
 * @param code - Course code (e.g. "BMA401")
 * @returns Course or SpecializationCourse object, or undefined if not found
 */
export const getCourseDetails = (
  code: string
): Course | SpecializationCourse | undefined => {
  if (!code) return undefined;
  return allCourses.get(code);
};

/**
 * Returns direct prerequisites for a given course.
 * @param code - Course code
 * @returns Array of prerequisite course codes
 */
export const getDirectPrereqs = (code: string): string[] => {
  const course = getCourseDetails(code);
  return course?.prereqs ?? [];
};

/**
 * Returns courses that depend on the given course (successors).
 * @param code - Prerequisite course code
 * @param specializationId - Optional specialization to limit the search
 * @returns Array of successor course codes
 */
export const getSuccessors = (
  code: string,
  specializationId: string | null = null
): string[] => {
  if (!code) return [];
  if (specializationId) {
    return findInSpecializations(code, specializationId);
  }

  return Array.from(prereqToSuccessors.get(code) || []);
};

/**
 * Calculates the student's current academic year based on passed course credits.
 * @param passedCourses - Array of passed course codes
 * @returns Object with totalCredits and currentYear
 */
export const calculateStudentStatus = (passedCourses: string[]) => {
  let totalCredits = 0;

  passedCourses.forEach((code) => {
    const course = getCourseDetails(code);
    if (course) {
      totalCredits += course.credits;
    }
  });

  let currentYear = 1;
  const sorted = [...iteData.meta.rules.promotion_thresholds].sort(
    (a, b) => b.min_credits - a.min_credits
  );

  for (const threshold of sorted) {
    if (totalCredits >= threshold.min_credits) {
      currentYear = threshold.year;
      break;
    }
  }

  return { totalCredits, currentYear };
};

/**
 * Returns courses that the student is eligible to register for,
 * based on already passed prerequisites.
 * @param passedCourses - Array of passed course codes
 * @returns Array of available course codes (excluding already passed courses)
 */
export const getAvailableCourses = (passedCourses: string[]): string[] => {
  const available: string[] = [];
  const passedSet = new Set(passedCourses);

  const checkCourse = (course: Course | SpecializationCourse): boolean => {
    if (passedSet.has(course.code)) return false;
    return course.prereqs.every((prereqCode) => passedSet.has(prereqCode));
  };

  allCourses.forEach((course) => {
    if (checkCourse(course)) {
      available.push(course.code);
    }
  });

  return available;
};
