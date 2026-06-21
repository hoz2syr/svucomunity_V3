import type { ITestStorage, TestModel } from '../storage/testStorage';
import { fetchTestsFromSupabase, upsertTestToSupabase, deleteTestFromSupabase } from '../../services/exam.supabase';

export class SupabaseTestStorage implements ITestStorage {
  private currentUserId: string | null = null;
  private cachedTests: TestModel[] = [];

  getCurrentUserId(): string | null {
    return this.currentUserId;
  }

  setCurrentUserId(userId: string | null) {
    this.currentUserId = userId;
  }

  getTests(): TestModel[] {
    return this.cachedTests;
  }

  saveTest(test: TestModel): void {
    const userId = this.currentUserId;
    if (!userId) {
      throw new Error('Cannot sync to Supabase without userId. Call setCurrentUserId first.');
    }
    const record = { ...test, userId };
    upsertTestToSupabase(record).catch((error) => {
      console.error('syncToServer failed', error);
    });
  }

  deleteTest(id: string): void {
    const userId = this.currentUserId;
    if (!userId) {
      throw new Error('Cannot delete from Supabase without userId. Call setCurrentUserId first.');
    }
    deleteTestFromSupabase({ testId: id, userId }).catch((error) => {
      console.error('delete from Supabase failed', error);
    });
    this.cachedTests = this.cachedTests.filter((t) => t.id !== id);
  }

  getTestById(id: string): TestModel | undefined {
    return this.cachedTests.find((test) => test.id === id);
  }

  hydrateFromServer(userId: string, serverTests: TestModel[]): void {
    this.currentUserId = userId;
    this.cachedTests = [...serverTests];
  }

  syncToServer(_test: TestModel): void {
    // Included for ITestStorage compatibility; actual push is implicit in saveTest() above.
  }

  getPendingSyncCount(_userId: string): number {
    return 0;
  }

  async drainPendingSync(_queue: (test: TestModel) => Promise<void>): Promise<void> {
    // no-op for now; Supabase path is eager through saveTest/deleteTest
  }
}

export const supabaseStorage = new SupabaseTestStorage();
