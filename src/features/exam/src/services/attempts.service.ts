import {
  getSupabaseClient,
  hasSupabaseEnv,
  missingSupabaseEnvMessage,
  refreshSession,
} from '@/src/lib/supabase';
import {
  toTestAttempt,
  isAuthError,
  type ExamSupabaseError,
  type TestAttemptRow,
} from './exam.helpers';

export const fetchTestAttempts = async (testId: string): Promise<{ data: ReturnType<typeof toTestAttempt>[]; error: ExamSupabaseError | null }> => {
  if (!hasSupabaseEnv()) {
    return { data: [], error: { message: missingSupabaseEnvMessage } };
  }

  try {
    const client = await getSupabaseClient();
    const { data, error } = await client
      .from('test_attempts')
      .select('id, test_id, user_id, score, total, answers, completed_at')
      .eq('test_id', testId)
      .order('completed_at', { ascending: false });

    if (error) {
      return { data: [], error: { message: error.message } };
    }

    const rows = (data ?? []) as TestAttemptRow[];
    return { data: rows.map(toTestAttempt), error: null };
  } catch (error) {
    return { data: [], error: { message: String(error) } };
  }
};

export const fetchUserAttemptHistory = async (userId: string): Promise<{ data: ReturnType<typeof toTestAttempt>[]; error: ExamSupabaseError | null }> => {
  if (!hasSupabaseEnv()) {
    return { data: [], error: { message: missingSupabaseEnvMessage } };
  }

  try {
    const client = await getSupabaseClient();
    const { data, error } = await client
      .from('test_attempts')
      .select('id, test_id, user_id, score, total, answers, completed_at')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });

    if (error) {
      return { data: [], error: { message: error.message } };
    }

    const rows = (data ?? []) as TestAttemptRow[];
    return { data: rows.map(toTestAttempt), error: null };
  } catch (error) {
    return { data: [], error: { message: String(error) } };
  }
};

export const saveTestAttempt = async (attempt: {
  testId: string;
  userId?: string | null;
  score: number;
  total: number;
  answers: Record<string, string>;
}): Promise<{ error: ExamSupabaseError | null }> => {
  if (!hasSupabaseEnv()) {
    return { error: { message: missingSupabaseEnvMessage } };
  }

  const attemptInsert = async (): Promise<{ error: ExamSupabaseError | null }> => {
    try {
      const client = await getSupabaseClient();
      const { error } = await client.from('test_attempts').insert({
        test_id: attempt.testId,
        user_id: attempt.userId ?? null,
        score: attempt.score,
        total: attempt.total,
        answers: attempt.answers,
      });

      if (error) {
        return { error: { message: error.message } };
      }
      return { error: null };
    } catch (error) {
      return { error: { message: String(error) } };
    }
  };

  const result = await attemptInsert();
  if (result.error && isAuthError(result.error)) {
    const refreshed = await refreshSession();
    if (refreshed) {
      return attemptInsert();
    }
  }

  return result;
};
