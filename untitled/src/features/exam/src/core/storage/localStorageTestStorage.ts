import type { ITestStorage, TestModel } from './testStorage';

const STORAGE_KEY = 'svu_tests_db';
const PREFIX = 'svu_tests_pending:';
const CURRENT_USER_KEY = 'svu_tests_current_user';

export class LocalFirstTestStorage implements ITestStorage {
  private currentUserId: string | null = null;

  private getCurrentUserId(): string | null {
    if (this.currentUserId) return this.currentUserId;
    try {
      const raw = localStorage.getItem(CURRENT_USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
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

  saveTest(test: TestModel): void {
    const tests = this.getTests();
    const idx = tests.findIndex(t => t.id === test.id);
    if (idx >= 0) {
      tests[idx] = test;
    } else {
      tests.push(test);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tests));
    this.enqueuePending(test);
  }

  deleteTest(id: string): void {
    const tests = this.getTests().filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tests));
  }

  getTestById(id: string): TestModel | undefined {
    return this.getTests().find(t => t.id === id);
  }

  hydrateFromServer(userId: string, serverTests: TestModel[]): void {
    this.currentUserId = userId;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userId));
    const localTests = this.getTests();
    const merged = new Map<string, TestModel>();
    for (const t of serverTests) merged.set(t.id, t);
    for (const t of localTests) merged.set(t.id, t);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(merged.values())));
    localStorage.setItem(`svu_tests_synced:${userId}`, '1');
  }

  private enqueuePending(test: TestModel): void {
    const userId = this.getCurrentUserId();
    if (!userId) return;
    const key = PREFIX + userId;
    try {
      const raw = localStorage.getItem(key);
      const queue: TestModel[] = raw ? JSON.parse(raw) : [];
      const exists = queue.some(t => t.id === test.id);
      if (!exists) queue.push(test);
      localStorage.setItem(key, JSON.stringify(queue));
    } catch {
      // ignore queue errors
    }
  }

  syncToServer(_test: TestModel): void {
    // No-op here; actual push is done via drainPendingSync(queue)
  }

  getPendingSyncCount(userId: string): number {
    try {
      const raw = localStorage.getItem(PREFIX + userId);
      return raw ? JSON.parse(raw).length : 0;
    } catch {
      return 0;
    }
  }

  async drainPendingSync(queue: (test: TestModel) => Promise<void>): Promise<void> {
    const userId = this.getCurrentUserId();
    if (!userId) return;
    const key = PREFIX + userId;
    try {
      const raw = localStorage.getItem(key);
      const pending: TestModel[] = raw ? JSON.parse(raw) : [];
      for (const test of pending) {
        await queue(test);
      }
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }
}

export const testStorage = new LocalFirstTestStorage();
