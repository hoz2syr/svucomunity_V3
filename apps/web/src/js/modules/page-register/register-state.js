import {
  initSupabase,
  getDb,
  verifySessionWithServer,
} from '../core.js';
import {
  COUNTRIES,
  loadSVUCourses,
  getMajorsList,
} from '../shared.js';
import { getLang } from '../i18n.js';

export let MAJORS = [];

export const state = {
  db: null,
  selected: COUNTRIES[0],
  dropOpen: false,
  selectedMajor: null,
  majorMenuOpen: false,
};

export function resolveDb() {
  const initialized = getDb() || initSupabase();
  if (typeof initialized !== 'undefined') state.db = initialized;
  return state.db;
}

export function getCurrentLang() {
  return getLang();
}

export async function fetchMajors() {
  try {
    const courses = await loadSVUCourses();
    const majors = new Set(getMajorsList());
    Object.values(courses || {}).forEach((course) => {
      if (typeof course?.major === 'string' && course.major.trim()) {
        majors.add(course.major.trim());
      }
    });
    const sorted = Array.from(majors).sort((a, b) => a.localeCompare(b, getCurrentLang() === 'en' ? 'en' : 'ar'));
    MAJORS = sorted;
    return sorted;
  } catch {
    return [];
  }
}
