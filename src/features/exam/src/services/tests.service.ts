import type { TestModel } from '../types';
import {
  getSupabaseClient,
  hasSupabaseEnv,
  missingSupabaseEnvMessage,
  refreshSession,
} from '@/src/lib/supabase';
import {
  toTestRow,
  toTestModel,
  stripCorrectAnswers,
  isAuthError,
  type ExamSupabaseError,
  type TestRow,
} from './exam.helpers';

export const fetchTestsFromSupabase = async (userId: string): Promise<{ data: TestModel[]; error: ExamSupabaseError | null }> => {
  if (!hasSupabaseEnv()) {
    return { data: [], error: { message: missingSupabaseEnvMessage } };
  }

  try {
    const client = await getSupabaseClient();
    const { data, error } = await client
      .from('tests')
      .select('id, title, description, settings, questions, rating, rating_count, published, created_at, updated_at')
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

export interface FetchTestsPageResult {
  data: TestModel[];
  error: ExamSupabaseError | null;
  nextCursor?: { created_at: string; id: string };
  hasMore: boolean;
}

export const fetchTestsPage = async (
  userId: string,
  cursor?: { created_at: string; id: string },
  limit = 9,
): Promise<FetchTestsPageResult> => {
  if (!hasSupabaseEnv()) {
    return { data: [], error: { message: missingSupabaseEnvMessage }, hasMore: false };
  }

  try {
    const client = await getSupabaseClient();
    const query = client
      .from('tests')
      .select('id, title, description, settings, questions, rating, rating_count, published, created_at, updated_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(limit + 1);

    if (cursor) {
      const cursorDate = new Date(cursor.created_at).toISOString();
      query.or(`created_at.lt.${cursorDate},and(created_at.eq.${cursorDate},id.lt.${cursor.id})`);
    }

    const { data, error } = await query;

    if (error) {
      return { data: [], error: { message: error.message }, hasMore: false };
    }

    const rows = (data ?? []) as TestRow[];
    const items = rows.map(toTestModel);
    const hasMore = items.length > limit;
    const sliced = hasMore ? items.slice(0, limit) : items;
    const nextCursor = hasMore && sliced.length > 0
      ? { created_at: new Date(sliced[sliced.length - 1].createdAt).toISOString(), id: sliced[sliced.length - 1].id }
      : undefined;

    return { data: sliced, error: null, nextCursor, hasMore };
  } catch (error) {
    return { data: [], error: { message: String(error) }, hasMore: false };
  }
};

export const upsertTestToSupabase = async (test: TestModel & { userId: string }): Promise<{ error: ExamSupabaseError | null }> => {
  if (!hasSupabaseEnv()) {
    return { error: { message: missingSupabaseEnvMessage } };
  }

  const attemptUpsert = async (): Promise<{ error: ExamSupabaseError | null }> => {
    try {
      const client = await getSupabaseClient();
      const row = toTestRow(test);
      const { error } = await client.from('tests').upsert(row, { onConflict: 'id' });
      if (error) {
        return { error: { message: error.message } };
      }
      return { error: null };
    } catch (error) {
      return { error: { message: String(error) } };
    }
  };

  const result = await attemptUpsert();
  if (result.error && isAuthError(result.error)) {
    const refreshed = await refreshSession();
    if (refreshed) {
      return attemptUpsert();
    }
  }

  return result;
};

export const deleteTestFromSupabase = async ({ testId, userId }: { testId: string; userId: string }): Promise<{ error: ExamSupabaseError | null }> => {
  if (!hasSupabaseEnv()) {
    return { error: { message: missingSupabaseEnvMessage } };
  }

  const attemptDelete = async (): Promise<{ error: ExamSupabaseError | null }> => {
    try {
      const client = await getSupabaseClient();
      const { error } = await client
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

  const result = await attemptDelete();
  if (result.error && isAuthError(result.error)) {
    const refreshed = await refreshSession();
    if (refreshed) {
      return attemptDelete();
    }
  }

  return result;
};

export const fetchTestByIdFromSupabase = async (testId: string, userId: string): Promise<{ data: TestModel | null; error: ExamSupabaseError | null }> => {
  if (!hasSupabaseEnv()) {
    return { data: null, error: { message: missingSupabaseEnvMessage } };
  }

  try {
    const client = await getSupabaseClient();
    const { data, error } = await client
      .from('tests')
      .select('id, title, description, settings, questions, rating, rating_count, published, created_at, updated_at')
      .eq('id', testId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      return { data: null, error: { message: error.message } };
    }

    if (!data) {
      return { data: null, error: null };
    }

    return { data: toTestModel(data as TestRow), error: null };
  } catch (error) {
    return { data: null, error: { message: String(error) } };
  }
};

export const fetchPublishedTestById = async (testId: string): Promise<{ data: TestModel | null; error: ExamSupabaseError | null }> => {
  if (!hasSupabaseEnv()) {
    return { data: null, error: { message: missingSupabaseEnvMessage } };
  }

  try {
    const client = await getSupabaseClient();
    const { data, error } = await client
      .from('tests')
      .select('id, title, description, settings, questions, rating, published, created_at, updated_at')
      .eq('id', testId)
      .eq('published', true)
      .maybeSingle();

    if (error) {
      return { data: null, error: { message: error.message } };
    }

    if (!data) {
      return { data: null, error: null };
    }

    const model = toTestModel(data as TestRow);
    return { data: { ...model, questions: stripCorrectAnswers(model.questions) }, error: null };
  } catch (error) {
    return { data: null, error: { message: String(error) } };
  }
};

export const fetchPublishedTests = async (
  limit = 20,
  cursor?: { created_at: string; id: string },
  major?: string,
  courseCode?: string,
  searchQuery?: string,
): Promise<FetchTestsPageResult> => {
  if (!hasSupabaseEnv()) {
    return { data: [], error: { message: missingSupabaseEnvMessage }, hasMore: false };
  }

  try {
    const client = await getSupabaseClient();
    const q = client
      .from('tests')
      .select('id, title, description, settings, rating, published, created_at, updated_at')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(limit + 1);

    if (cursor) {
      const cursorDate = new Date(cursor.created_at).toISOString();
      q.or(`created_at.lt.${cursorDate},and(created_at.eq.${cursorDate},id.lt.${cursor.id})`);
    }

    if (major) {
      q.eq('major', major);
    }

    if (courseCode) {
      q.eq('course_code', courseCode);
    }

    if (searchQuery) {
      const pattern = `%${searchQuery}%`;
      q.or(`title.ilike.${pattern},description.ilike.${pattern}`);
    }

    const { data, error } = await q;

    if (error) {
      return { data: [], error: { message: error.message }, hasMore: false };
    }

    const rows = (data ?? []) as TestRow[];
    const items = rows.map(row => {
      const model = toTestModel(row);
      return { ...model, questions: [] };
    });
    const hasMore = items.length > limit;
    const sliced = hasMore ? items.slice(0, limit) : items;
    const nextCursor = hasMore && sliced.length > 0
      ? { created_at: new Date(sliced[sliced.length - 1].createdAt).toISOString(), id: sliced[sliced.length - 1].id }
      : undefined;

    return { data: sliced, error: null, nextCursor, hasMore };
  } catch (error) {
    return { data: [], error: { message: String(error) }, hasMore: false };
  }
};
