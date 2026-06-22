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
  rating_count: number | null;
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
  rating_count: 0,
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
    const query = getSupabaseClient()
      .from('tests')
      .select('*')
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

  try {
    const row = toTestRow(test);
    const { error } = await getSupabaseClient().from('tests').upsert(row, { onConflict: 'id' });
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

const stripCorrectAnswers = (questions: TestModel['questions']): TestModel['questions'] =>
  questions.map(q => {
    if (q.type === 'essay' || q.type === 'true_false') return q;
    return { ...q, correctAnswer: undefined, correctAnswers: undefined };
  });

export const fetchPublishedTestById = async (testId: string): Promise<{ data: TestModel | null; error: ExamSupabaseError | null }> => {
  if (!hasSupabaseEnv()) {
    return { data: null, error: { message: missingSupabaseEnvMessage } };
  }

  try {
    const { data, error } = await getSupabaseClient()
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
): Promise<FetchTestsPageResult> => {
  if (!hasSupabaseEnv()) {
    return { data: [], error: { message: missingSupabaseEnvMessage }, hasMore: false };
  }

  try {
    const q = getSupabaseClient()
      .from('tests')
      .select('id, title, description, settings, questions, rating, published, created_at, updated_at')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(limit + 1);

    if (cursor) {
      const cursorDate = new Date(cursor.created_at).toISOString();
      q.or(`created_at.lt.${cursorDate},and(created_at.eq.${cursorDate},id.lt.${cursor.id})`);
    }

    const { data, error } = await q;

    if (error) {
      return { data: [], error: { message: error.message }, hasMore: false };
    }

    const rows = (data ?? []) as TestRow[];
    const items = rows.map(row => {
      const model = toTestModel(row);
      return { ...model, questions: stripCorrectAnswers(model.questions) };
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

export interface RateTestSupabaseResult {
  success: boolean;
  updatedRating?: number;
  error?: string;
}

const RATING_MIN = 1;
const RATING_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_ATTEMPTS = 10;

const getRateLimitRecord = (): { count: number; resetAt: number } | null => {
  try {
    const raw = localStorage.getItem('svu_tests_rate_limit');
    if (!raw) return null;
    const record = JSON.parse(raw) as { count: number; resetAt: number };
    if (Date.now() > record.resetAt) {
      localStorage.removeItem('svu_tests_rate_limit');
      return null;
    }
    return record;
  } catch {
    return null;
  }
};

const setRateLimitRecord = (count: number): void => {
  localStorage.setItem(
    'svu_tests_rate_limit',
    JSON.stringify({ count, resetAt: Date.now() + RATE_LIMIT_WINDOW_MS }),
  );
};

const checkRatingRateLimit = (_testId: string): boolean => {
  const existing = getRateLimitRecord();
  if (!existing) {
    setRateLimitRecord(1);
    return true;
  }
  if (existing.count >= RATE_LIMIT_MAX_ATTEMPTS) return false;
  setRateLimitRecord(existing.count + 1);
  return true;
};

export const rateTestInSupabase = async (testId: string, rating: number): Promise<RateTestSupabaseResult> => {
  if (!hasSupabaseEnv()) {
    return { success: false, error: missingSupabaseEnvMessage };
  }

  if (!Number.isInteger(rating) || rating < RATING_MIN || rating > RATING_MAX) {
    return { success: false, error: `التقييم يجب أن يكون بين ${RATING_MIN} و ${RATING_MAX}.` };
  }

  if (!checkRatingRateLimit(testId)) {
    return { success: false, error: 'تم إرسال عدد كبير من التقييمات. يرجى المحاولة لاحقاً.' };
  }

  try {
    const client = getSupabaseClient();
    const { data, error } = await client.functions.invoke('rate-test', {
      body: { testId, rating },
    });

    if (error || data?.error) {
      return { success: false, error: data?.error || error?.message || 'فشل إرسال التقييم.' };
    }

    return {
      success: data?.success ?? true,
      updatedRating: data?.updatedRating,
      error: data?.error ?? (data?.success ? undefined : 'فشل إرسال التقييم.'),
    };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};
