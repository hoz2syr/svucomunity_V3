import { localStorageTestStorage } from '@/src/features/exam/src/core/storage/localStorageTestStorage';

export const clearLocalExamData = (userId?: string): void => {
  localStorageTestStorage.clearUserData(userId);
};
