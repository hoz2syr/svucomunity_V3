import { iteData } from '../data/ite_data';
import type { Course, SpecializationCourse, SpecializationId, CourseCode } from '../types';
import { MAX_AVAILABLE_DEPTH } from './constants';

// Memory guard: course cache is rebuilt once at startup, but the cache object
// itself remains allocated for the app lifetime. With large ITE datasets and
// future runtime growth, cap its size and evict oldest entries to prevent
// unbounded memory consumption.
const courseCache = new Map<CourseCode, Course | SpecializationCourse>();
const MAX_COURSE_CACHE_SIZE = 100;
const coursesByPrereq = new Map<CourseCode, CourseCode[]>();

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

    if (courseCache.size > MAX_COURSE_CACHE_SIZE) {
        const excess = courseCache.size - MAX_COURSE_CACHE_SIZE;
        let removed = 0;
        for (const key of courseCache.keys()) {
            courseCache.delete(key);
            removed++;
            if (removed >= excess) break;
        }
    }
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
Object.entries(iteData.specialization_courses).forEach(([specId, spec]) => {
    const codes = new Set<CourseCode>();
    Object.values(spec.tracks).forEach((track) => {
        Object.values(track.courses).forEach((c) => {
            codes.add(c.code);
        });
    });
    SPEC_CODES_BY_SPEC.set(specId as SpecializationId, codes);
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
    const uniquePassed = Array.from(new Set(passedCourses));
    let totalCredits = 0;

    for (const code of uniquePassed) {
        const course = getCourseDetails(code);
        if (course) {
            totalCredits += course.credits;
        }
    }

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
        console.warn(`[courseUtils] Max depth reached for course ${course.code}, possible circular dependency`);
        return false;
    }

    return course.prereqs.every((prereqCode) => {
        const prereq = getCourseDetails(prereqCode);
        if (!prereq) {
            console.warn(`[courseUtils] Prerequisite not found: ${prereqCode} (required by ${course.code})`);
            return false;
        }
        if (allPassed.has(prereqCode)) return true;
        return isCourseAvailable(allPassed, prereq, depth + 1);
    });
};

export const getAvailableCourses = (passedCourses: string[]): CourseCode[] => {
    const available: CourseCode[] = [];
    const passedSet = new Set<CourseCode>(passedCourses);

    const processList = <T extends Course | SpecializationCourse>(list: T[]) => {
        for (const course of list) {
            if (isCourseAvailable(passedSet, course, 0)) {
                available.push(course.code);
            }
        }
    };

    processList(coreCourses);
    processList(allSpecCourses);

    return available;
};
