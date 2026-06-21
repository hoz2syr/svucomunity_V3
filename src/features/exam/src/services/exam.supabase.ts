import { getSupabaseClient, hasSupabaseEnv, missingSupabaseEnvMessage } from '@/src/lib/supabase';
import type { TestModel } from '@/src/features/exam/src/types';

export interface TestRow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  settings: TestModel['settings'];
  questions: TestModel['questions'];
  rating: number | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export const toTestRow = (test: TestModel & { userId: string }): Omit<TestRow, 'created_at' | 'updated_at'> => ({
  id: test.id,
  user_id: test.userId,
  title: test.title,
  description: test.description ?? null,
  settings: test.settings,
  questions: test.questions,
  rating: test.rating ?? null,
  published: test.published ?? false,
});

export const toTestModel = (row: TestRow): TestModel => ({
  id: row.id,
  title: row.title,
  description: row.description ?? undefined,
  createdAt: Date.parse(row.created_at),
  settings: row.settings,
  questions: row.questions,
  rating: row.rating ?? undefined,
  published: row.published,
});

export type ExamSupabaseError = { message: string };

export const fetchTestsFromSupabase = async (userId: string): Promise<{ data: TestModel[]; error: ExamSupabaseError | null }> => {
  if (!hasSupabaseEnv()) {
    return { data: [], error: { message: missingSupabaseEnvMessage } };
  }

  try {
    const { data, error } = await getSupabaseClient()
      .from('tests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return { data: [], error: { message: error.message } };
    }

    const rows = (data ?? []) as TestRow[];
    return { data: rows.map(toTestModel), error: null };
  } catch (error) {
    return { data: [], error: { message: String(error) } };
  }
};

export const upsertTestToSupabase = async (test: TestModel & { userId: string }): Promise<{ error: ExamSupabaseError | null }> => {
  if (!hasSupabaseEnv()) {
    return { error: { message: missingSupabaseEnvMessage } };
  }

  try {
    const row = toTestRow(test);
    const { error } = await getSupabaseClient().from('tests').upsert(row);
    if (error) {
      return { error: { message: error.message } };
    }
    return { error: null };
  } catch (error) {
    return { error: { message: String(error) } };
  }
};

export const deleteTestFromSupabase = async ({ testId, userId }: { testId: string; userId: string }): Promise<{ error: ExamSupabaseError | null }> => {
  if (!hasSupabaseEnv()) {
    return { error: { message: missingSupabaseEnvMessage } };
  }

  try {
    const { error } = await getSupabaseClient()
      .from('tests')
      .delete()
      .eq('id', testId)
      .eq('user_id', userId);

    if (error) {
      return { error: { message: error.message } };
    }
    return { error: null };
  } catch (error) {
    return { error: { message: String(error) } };
  }
};
