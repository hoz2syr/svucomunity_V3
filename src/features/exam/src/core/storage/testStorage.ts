import type { TestModel } from '../../types';

export interface ITestStorage {
  getTests(): TestModel[];
  saveTest(test: TestModel): Promise<void>;
  deleteTest(id: string): Promise<void>;
  getTestById(id: string): TestModel | undefined;
  getCurrentUserId(): string | null;
  clearUserData?(userId?: string): void;
}

export type { TestModel } from '../../types';
