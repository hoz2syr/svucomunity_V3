export type QuestionType = 'multiple_choice' | 'true_false' | 'essay';

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[]; // Used for multiple_choice
  correctAnswer?: string; // For true_false, 'true' or 'false'. Fallback for essay.
  correctAnswers?: string[]; // Preferred for essay/open-ended: one or more accepted answers.
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
  rating?: number;
  ratedBySession?: boolean;
}


