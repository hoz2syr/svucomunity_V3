import type { Course } from '../src/types';

export interface CourseCatalog {
  major: string;
  courses: Course[];
}

let catalogCache: Record<string, { name: string; code: string }[]> = {};

async function loadCatalog(): Promise<Record<string, { name: string; code: string }[]>> {
  if (Object.keys(catalogCache).length > 0) return catalogCache;
  try {
    const res = await fetch('/svu_courses.json');
    if (!res.ok) throw new Error('Failed to load course catalog');
    catalogCache = await res.json();
  } catch {
    catalogCache = {};
  }
  return catalogCache;
}

export async function getCoursesByMajorStatic(major: string): Promise<Course[]> {
  const catalog = await loadCatalog();
  const raw = catalog[major];
  if (raw) {
    return raw.map((c) => ({ code: c.code, name: c.name }));
  }
  for (const [key, courses] of Object.entries(catalog)) {
    if (key.toLowerCase().includes(major.toLowerCase()) || major.toLowerCase().includes(key.toLowerCase())) {
      return courses.map((c) => ({ code: c.code, name: c.name }));
    }
  }
  return [];
}

export async function getAllMajorsStatic(): Promise<string[]> {
  const catalog = await loadCatalog();
  return Object.keys(catalog).sort();
}

export async function getAllLevelsStatic(): Promise<string[]> {
  return ['1', '2', '3', '4', '5'];
}

export async function searchCourses(query: string, major?: string): Promise<Course[]> {
  const q = query.toLowerCase();
  const catalog = await loadCatalog();
  const majorsToSearch = major ? [major] : Object.keys(catalog);
  const results: Course[] = [];
  for (const m of majorsToSearch) {
    const courses = catalog[m] || [];
    for (const c of courses) {
      if (c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)) {
        results.push({ code: c.code, name: c.name });
      }
    }
  }
  return results;
}
