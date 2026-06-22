import type { TestModel } from '../models/test';
import type { ITestStorage } from '../storage/testStorage';

export interface RateTestInput {
  testId: string;
  rating: number;
}

export interface RateTestResult {
  success: boolean;
  error?: string;
  updatedRating?: number;
}

export class TestService {
  constructor(private readonly storage: ITestStorage) {}

  getTests(): TestModel[] {
    return this.storage.getTests();
  }

  getTestById(id: string): TestModel | undefined {
    return this.storage.getTestById(id);
  }

  async saveTest(test: TestModel): Promise<void> {
    await this.storage.saveTest(test);
  }

  async deleteTest(id: string): Promise<void> {
    await this.storage.deleteTest(id);
  }

  rateTest(input: RateTestInput): RateTestResult {
    if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
      return { success: false, error: 'التقييم يجب أن يكون رقماً صحيحاً بين 1 و 5' };
    }

    const tests = this.storage.getTests();
    const idx = tests.findIndex((t: TestModel) => t.id === input.testId);

    if (idx === -1) {
      return { success: false, error: 'الاختبار غير موجود' };
    }

    const existing = tests[idx].rating;
    const updatedRating = existing ? Math.round((existing + input.rating) / 2) : input.rating;

    const updated: TestModel = {
      ...tests[idx],
      rating: updatedRating,
    };

    this.storage.saveTest(updated);

    return { success: true, updatedRating };
  }
}

export type RatedSessionState = Record<string, boolean>;
