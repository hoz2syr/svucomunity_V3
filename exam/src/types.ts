export type QuestionType = 'multiple_choice' | 'true_false' | 'essay';

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[]; // Used for multiple_choice
  correctAnswer?: string; // For true_false, 'true' or 'false'. 
  explanation?: string;
  timeLimitSeconds?: number; // Optional per-question timer
}

export interface TestSettings {
  showExplanations: boolean;
  globalTimeLimitMinutes?: number;
}

export interface TestModel {
  id: string;
  title: string;
  description: string;
  createdAt: number;
  settings: TestSettings;
  questions: Question[];
}

export interface AnalyticsStats {
  totalTests: number;
  totalQuestions: number;
  recentTestCount: number;
}
