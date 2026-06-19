import { TestModel } from '../types';

const STORAGE_KEY = 'svu_tests_db';

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
