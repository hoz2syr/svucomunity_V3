import { getSupabaseClient, hasSupabaseEnv, missingSupabaseEnvMessage } from '@/src/lib/supabase';

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
    const client = await getSupabaseClient();
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
