import { describe, it, expect } from 'vitest';
import { getCourseDetails, getDirectPrereqs, getSuccessors, getAvailableCourses, calculateStudentStatus } from '../components/interactive-map/lib/courseUtils';

describe('courseUtils', () => {
  it('returns course details by code', () => {
    const course = getCourseDetails('BMA401');
    expect(course).toBeDefined();
    expect(course?.name_ar).toBe('تحليل رياضي 1');
  });

  it('returns prereqs for a course', () => {
    expect(getDirectPrereqs('BMA402')).toEqual(['BMA401']);
    expect(getDirectPrereqs('BMA401')).toEqual([]);
  });

  it('calculates student status', () => {
    const bma401Credits = getCourseDetails('BMA401')?.credits ?? 0;
    expect(calculateStudentStatus([])).toEqual({ totalCredits: 0, currentYear: 1 });
    expect(calculateStudentStatus(['BMA401'])).toEqual({ totalCredits: bma401Credits, currentYear: 1 });
  });

  it('returns successors for a course', () => {
    expect(getSuccessors('BMA401')).toContain('BMA402');
  });

  it('returns undefined for nonexistent course', () => {
    expect(getCourseDetails('NONEXISTENT')).toBeUndefined();
    expect(getDirectPrereqs('NONEXISTENT')).toEqual([]);
    expect(getSuccessors('NONEXISTENT')).toEqual([]);
  });

  it('returns available courses', () => {
    const available = getAvailableCourses(['BMA401']);
    expect(available).toContain('BMA402');
    expect(available).not.toContain('BMA401');
  });
});
