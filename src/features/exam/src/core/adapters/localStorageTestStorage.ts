import type { ITestStorage, TestModel } from '../storage/testStorage';
import { STORAGE_KEY, CURRENT_USER_KEY, PENDING_PREFIX, SYNCED_PREFIX, clearAllExamLocalData } from '../utils/storageKeys';

export class LocalFirstTestStorage implements ITestStorage {
  private currentUserId: string | null = null;

  getCurrentUserId(): string | null {
    if (this.currentUserId !== null) return this.currentUserId;
    try {
      const raw = localStorage.getItem(CURRENT_USER_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.currentUserId = typeof parsed === 'string' ? parsed : null;
        return this.currentUserId;
      }
    } catch {
      // ignore corrupt localStorage value
    }
    return null;
  }

  setCurrentUserId(userId: string | null) {
    this.currentUserId = userId;
    if (userId) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userId));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }

  getTests(): TestModel[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  async saveTest(test: TestModel): Promise<void> {
    const tests = this.getTests();
    const idx = tests.findIndex(t => t.id === test.id);
    if (idx >= 0) {
      tests[idx] = test;
    } else {
      tests.push(test);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tests));
  }

  async deleteTest(id: string): Promise<void> {
    const tests = this.getTests().filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tests));
  }

  getTestById(id: string): TestModel | undefined {
    return this.getTests().find(t => t.id === id);
  }

  hydrateFromServer(_userId: string, serverTests: TestModel[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serverTests));
  }

  clearUserData(userId?: string): void {
    clearAllExamLocalData(userId);
    const targetUserId = userId ?? this.getCurrentUserId();
    if (targetUserId) {
      localStorage.removeItem(`${PENDING_PREFIX}${targetUserId}`);
      localStorage.removeItem(`${SYNCED_PREFIX}${targetUserId}`);
    }
    this.currentUserId = null;
  }
}

export const localStorageTestStorage = new LocalFirstTestStorage();
