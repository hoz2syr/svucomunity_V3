import type { ExtractedCourse, MatchedGroup } from '../types';
import type { MatchResult } from '../types';

function majorMatches(extracted: string, group: string): boolean {
  const ext = extracted.toLowerCase();
  const grp = group.toLowerCase();

  if ((ext.includes('information technology') || ext.includes('ite')) &&
      (grp.includes('information technology') || grp.includes('ite'))) return true;
  if (ext.includes('engineering') && grp.includes('engineering')) return true;
  if ((ext.includes('business') || ext.includes('ba') || ext.includes('bba')) &&
      (grp.includes('business') || grp.includes('ba') || grp.includes('bba'))) return true;
  if ((ext.includes('computer science') || ext.includes('cs')) &&
      (grp.includes('computer science') || grp.includes('cs'))) return true;
  if (ext.includes('eng') && grp.includes('eng')) return true;

  return ext === grp;
}

function fuzzyCodeMatch(a: string, b: string): boolean {
  const upperA = a.toUpperCase();
  const upperB = b.toUpperCase();
  if (upperA === upperB) return true;
  if (upperA.startsWith(upperB.slice(0, 3)) || upperB.startsWith(upperA.slice(0, 3))) return true;
  if (upperA.includes(upperB) || upperB.includes(upperA)) return true;
  return false;
}

interface MatchScore {
  group: MatchedGroup;
  score: number;
  reasons: string[];
}

function calculateMatchScore(course: ExtractedCourse, group: MatchedGroup, extractedMajor: string): MatchScore | null {
  const reasons: string[] = [];
  let score = 0;

  const codeMatch = course.code.toUpperCase() === group.course_code.toUpperCase();
  const majorMatch = majorMatches(extractedMajor, group.major);
  const fuzzyCode = fuzzyCodeMatch(course.code, group.course_code);

  if (codeMatch && majorMatch) {
    score = 100;
    reasons.push('same-code+same-major');
  } else if (codeMatch && !majorMatch) {
    score = 60;
    reasons.push('same-code+different-major');
  } else if (!codeMatch && majorMatch && fuzzyCode) {
    score = 40;
    reasons.push('same-major+fuzzy-code');
  } else if (!codeMatch && majorMatch) {
    score = 20;
    reasons.push('same-major-only');
  }

  if (score === 0) return null;

  if (course.section && group.class_number && course.section === group.class_number) {
    score = Math.min(100, score + 5);
    reasons.push('same-section');
  }

  return { group, score, reasons };
}

export function matchCoursesToGroups(
  extractedCourses: ExtractedCourse[],
  existingGroups: MatchedGroup[],
  extractedMajor: string
): MatchResult {
  const matched: MatchedGroup[] = [];
  const unmatched: ExtractedCourse[] = [];

  for (const course of extractedCourses) {
    const candidates = existingGroups
      .map((g) => calculateMatchScore(course, g, extractedMajor))
      .filter((m): m is MatchScore => m !== null)
      .sort((a, b) => b.score - a.score);

    if (candidates.length > 0) {
      for (const c of candidates) {
        matched.push({
          ...c.group,
          matchScore: c.score,
          matchReasons: c.reasons,
        });
      }
    } else {
      unmatched.push(course);
    }
  }

  return { matched, unmatched };
}

export { type MatchResult } from '../types';
