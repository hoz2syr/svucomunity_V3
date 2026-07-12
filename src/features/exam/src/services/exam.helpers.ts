import type { TestModel, TestAttempt } from '../types';

export interface TestRow {
  id: string;
  user_id?: string | null;
  title: string;
  description: string | null;
  settings: TestModel['settings'];
  questions: TestModel['questions'];
  rating: number | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface TestAttemptRow {
  id: string;
  test_id: string;
  user_id: string | null;
  score: number;
  total: number;
  answers: Record<string, string>;
  completed_at: string;
}

export const toTestRow = (test: TestModel & { userId: string }): Omit<TestRow, 'created_at' | 'updated_at'> => ({
  id: test.id,
  user_id: test.userId,
  title: test.title,
  description: test.description ?? null,
  settings: test.settings,
  questions: test.questions,
  rating: test.rating ?? null,
  published: test.published ?? false,
});

export const toTestModel = (row: TestRow): TestModel => ({
  id: row.id,
  title: row.title,
  description: row.description ?? undefined,
  createdAt: Date.parse(row.created_at),
  settings: row.settings,
  questions: row.questions,
  rating: row.rating ?? undefined,
  published: row.published,
});

export const toTestAttempt = (row: TestAttemptRow): TestAttempt => ({
  id: row.id,
  testId: row.test_id,
  userId: row.user_id ?? null,
  score: row.score,
  total: row.total,
  answers: row.answers,
  completedAt: row.completed_at,
});

export const stripCorrectAnswers = (questions: TestModel['questions']): TestModel['questions'] =>
  questions.map(q => {
    if (q.type === 'essay' || q.type === 'true_false') return q;
    return { ...q, correctAnswer: undefined, correctAnswers: undefined };
  });

export const isAuthError = (error: unknown): boolean => {
  const err = error as { message?: string; code?: string; status?: number } | null;
  if (!err) return false;
  if (err.status === 401) return true;
  if (typeof err.message !== 'string') return false;
  const msg = err.message.toLowerCase();
  return msg.includes('jwt') || msg.includes('expired') || msg.includes('invalid') || msg.includes('token');
};

export type ExamSupabaseError = { message: string };
