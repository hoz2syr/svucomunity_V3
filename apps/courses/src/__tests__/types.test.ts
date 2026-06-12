import { describe, it, expect } from 'vitest';
import { isCourseType, isBaseCourse } from '../components/interactive-map/types';

describe('interactive-map types', () => {
  it('recognizes valid course types', () => {
    expect(isCourseType('core')).toBe(true);
    expect(isCourseType('invalid')).toBe(false);
  });

  it('rejects null and undefined course types', () => {
    expect(isCourseType(null)).toBe(false);
    expect(isCourseType(undefined)).toBe(false);
  });

  it('validates base course shape', () => {
    expect(isBaseCourse({ code: 'X', name_ar: 'Y', credits: 3, prereqs: [] })).toBe(true);
    expect(isBaseCourse({ code: 'X' })).toBe(false);
    expect(isBaseCourse(null)).toBe(false);
    expect(isBaseCourse({ code: 'X', name_ar: 123, credits: 3, prereqs: [] } as unknown as Parameters<typeof isBaseCourse>[0])).toBe(false);
    expect(isBaseCourse({ code: 'X', name_ar: true, credits: 3, prereqs: [] } as unknown as Parameters<typeof isBaseCourse>[0])).toBe(false);
  });
});
