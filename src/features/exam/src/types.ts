export type QuestionType = 'multiple_choice' | 'true_false' | 'essay';

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[];
  correctAnswer?: string;
  correctAnswers?: string[];
  explanation?: string;
  timeLimitSeconds?: number;
}

export interface TestSettings {
  showExplanations: boolean;
  globalTimeLimitMinutes?: number;
  major?: string;
  courseCode?: string;
}

export type TestPublishStatus = 'private_local' | 'private_synced' | 'published';

export interface TestModel {
  id: string;
  title: string;
  description?: string;
  createdAt: number;
  settings: TestSettings;
  questions: Question[];
  rating?: number;
  ratedBySession?: boolean;
  published: boolean;
  publishedAt?: string;
  userId?: string;
}

export interface TestAttempt {
  id: string;
  testId: string;
  userId: string | null;
  score: number;
  total: number;
  answers: Record<string, string>;
  completedAt: string;
}
