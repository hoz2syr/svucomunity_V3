import { TestModel } from '../types';

const STORAGE_KEY = 'svu_tests_db';
const RATING_SESSION_KEY = 'svu_tests_rated_sessions';

// TODO(Integration): Replace localStorage with your database calls (e.g., Supabase / API).
export const getTests = (): TestModel[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error reading from localStorage', e);
    return [];
  }
};

export const saveTest = (test: TestModel): void => {
  const tests = getTests();
  const existingIndex = tests.findIndex(t => t.id === test.id);

  if (existingIndex >= 0) {
    tests[existingIndex] = test;
  } else {
    tests.push(test);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(tests));
};

export const deleteTest = (id: string): void => {
  const tests = getTests().filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tests));
};

export const getTestById = (id: string): TestModel | undefined => {
  return getTests().find(t => t.id === id);
};

export const getRatedSessions = (): Record<string, boolean> => {
  try {
    const data = localStorage.getItem(RATING_SESSION_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

export const markTestRatedInSession = (id: string): void => {
  const rated = getRatedSessions();
  rated[id] = true;
  localStorage.setItem(RATING_SESSION_KEY, JSON.stringify(rated));
};

export const rateTest = (id: string, rating: number, answeredCount?: number, totalQuestions?: number): { success: boolean; error?: string } => {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { success: false, error: 'التقييم يجب أن يكون رقماً صحيحاً بين 1 و 5' };
  }

  const rated = getRatedSessions();

  if (rated[id]) {
    return { success: false, error: 'لقد قمت بتقييم هذا الاختبار مسبقاً في هذه الجلسة' };
  }

  if (typeof answeredCount === 'number' && typeof totalQuestions === 'number') {
    if (answeredCount < 1) {
      return { success: false, error: 'يجب أن تجيب على سؤال واحد على الأقل قبل التقييم' };
    }
    if (answeredCount < totalQuestions) {
      const confirmUnfinished = window.confirm(
        `لم تجب على جميع الأسئلة (${answeredCount} من ${totalQuestions}). هل تريد تقييم الاختبار الآن؟`
      );
      if (!confirmUnfinished) {
        return { success: false, error: 'تم إلغاء التقييم' };
      }
    }
  }

  const tests = getTests();
  const idx = tests.findIndex(t => t.id === id);

  if (idx === -1) {
    return { success: false, error: 'الاختبار غير موجود' };
  }

  const existing = tests[idx].rating;
  const newRating = existing ? Math.round((existing + rating) / 2) : rating;

  tests[idx] = {
    ...tests[idx],
    rating: newRating,
    ratedBySession: true,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(tests));
  markTestRatedInSession(id);

  return { success: true };
};
