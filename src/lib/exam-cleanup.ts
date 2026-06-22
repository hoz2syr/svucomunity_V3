import { localStorageTestStorage } from '@/src/features/exam/src/core/adapters/localStorageTestStorage';

export const clearLocalExamData = (userId?: string): void => {
  localStorageTestStorage.clearUserData(userId);
};
