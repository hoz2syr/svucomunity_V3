export type ITestStorage = {
  getTests(): TestModel[];
  saveTest(test: TestModel): void;
  deleteTest(id: string): void;
  getTestById(id: string): TestModel | undefined;
};

export type { TestModel } from '../../types';
