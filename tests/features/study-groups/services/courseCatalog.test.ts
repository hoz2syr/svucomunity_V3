import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCoursesByMajorStatic, getAllMajorsStatic, searchCourses } from '@/src/features/study-groups/src/services/courseCatalog';

const mockCatalog = {
  CS: [
    { code: 'CS101', name: 'Intro to CS' },
    { code: 'CS201', name: 'Data Structures' },
  ],
  Engineering: [
    { code: 'ENG101', name: 'Intro to Engineering' },
    { code: 'ENG201', name: 'Thermodynamics' },
  ],
};

describe('courseCatalog service', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn(async () =>
      new Response(JSON.stringify(mockCatalog), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    ) as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.clearAllMocks();
  });

  describe('getCoursesByMajorStatic', () => {
    it('should return courses for an exact major match', async () => {
      const courses = await getCoursesByMajorStatic('CS');
      expect(courses).toHaveLength(2);
      expect(courses[0]).toEqual({ code: 'CS101', name: 'Intro to CS' });
    });

    it('should return empty array for unknown major', async () => {
      const courses = await getCoursesByMajorStatic('Unknown');
      expect(courses).toHaveLength(0);
    });

    it('should do case-insensitive partial match on major key', async () => {
      const courses = await getCoursesByMajorStatic('cs');
      expect(courses).toHaveLength(2);
    });

    it('should match major key that contains search term', async () => {
      const courses = await getCoursesByMajorStatic('engineer');
      expect(courses).toHaveLength(2);
    });

    it('should match search term that contains major key', async () => {
      const courses = await getCoursesByMajorStatic('gineer');
      expect(courses).toHaveLength(2);
    });
  });

  describe('getAllMajorsStatic', () => {
    it('should return all majors sorted', async () => {
      const majors = await getAllMajorsStatic();
      expect(majors).toEqual(['CS', 'Engineering']);
    });
  });

  describe('searchCourses', () => {
    it('should search courses by name across all majors', async () => {
      const results = await searchCourses('intro');
      expect(results).toHaveLength(2);
    });

    it('should search courses by code', async () => {
      const results = await searchCourses('ENG201');
      expect(results).toHaveLength(1);
      expect(results[0].code).toBe('ENG201');
    });

    it('should filter by major when provided', async () => {
      const results = await searchCourses('intro', 'Engineering');
      expect(results).toHaveLength(1);
      expect(results[0].code).toBe('ENG101');
    });

    it('should return empty array when no matches', async () => {
      const results = await searchCourses('zzz-no-match');
      expect(results).toHaveLength(0);
    });

    it('should be case-insensitive', async () => {
      const results = await searchCourses('DATA');
      expect(results).toHaveLength(1);
      expect(results[0].code).toBe('CS201');
    });
  });
});
