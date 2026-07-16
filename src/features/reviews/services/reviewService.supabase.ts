import { hasSupabaseEnv, getSupabaseClient, getErrorMessage } from '@/src/lib/supabase';
import type { Review, CreateReviewInput, RespondToReviewInput, ReviewFilters } from '../types';
import type { ServiceResult } from '@/src/types/admin';
export type { Review, CreateReviewInput, RespondToReviewInput, ReviewFilters } from '../types';

const mapRow = (row: Record<string, unknown>): Review => ({
  id: String(row.id),
  user_id: String(row.user_id),
  rating: Number(row.rating ?? 0),
  category: String(row.category ?? 'other') as Review['category'],
  comment: String(row.comment ?? ''),
  status: String(row.status ?? 'pending') as Review['status'],
  admin_response: row.admin_response ? String(row.admin_response) : null,
  responded_by: row.responded_by ? String(row.responded_by) : null,
  responded_at: row.responded_at ? String(row.responded_at) : null,
  created_at: String(row.created_at ?? ''),
  profiles: row.profiles as Review['profiles'],
});

const createMissingEnvError = (): ServiceResult<never> => ({
  data: null,
  error: new Error('Supabase not configured'),
});

export async function createReview(
  userId: string,
  input: CreateReviewInput,
): Promise<ServiceResult<Review>> {
  if (!hasSupabaseEnv()) {
    return createMissingEnvError();
  }

  if (input.rating < 1 || input.rating > 5) {
    return { data: null, error: new Error('Rating must be between 1 and 5') };
  }

  try {
    const client = await getSupabaseClient();
    const { data, error } = await client
      .from('platform_reviews')
      .insert({
        user_id: userId,
        rating: input.rating,
        category: input.category,
        comment: input.comment,
        status: 'pending',
      })
      .select('id, user_id, rating, category, comment, status, admin_response, responded_by, responded_at, created_at, profiles:profiles!left(full_name, email, username)')
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: mapRow(data as Record<string, unknown>), error: null };
  } catch (error) {
    return { data: null, error: new Error(getErrorMessage(error)) };
  }
}

export async function listAllReviews(
  callerRole: string,
  page = 1,
  limit = 50,
  filters?: ReviewFilters,
): Promise<ServiceResult<Review[]>> {
  if (callerRole !== 'admin') {
    return { data: null, error: new Error('Unauthorized') };
  }

  if (!hasSupabaseEnv()) {
    return createMissingEnvError();
  }

  const client = await getSupabaseClient();
  const from = (page - 1) * limit;

  let query = client
    .from('platform_reviews')
    .select('id, user_id, rating, category, comment, status, admin_response, responded_by, responded_at, created_at, profiles:profiles!left(full_name, email, username)')
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1);

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.category) {
    query = query.eq('category', filters.category);
  }

  if (filters?.search) {
    query = query.or(`comment.ilike.%${filters.search}%,profiles.full_name.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  const reviews: Review[] = ((data as unknown) as Record<string, unknown>[]).map(mapRow);

  return { data: reviews, error: null };
}

export async function listPublicReviews(): Promise<ServiceResult<Review[]>> {
  if (!hasSupabaseEnv()) {
    return createMissingEnvError();
  }

  const client = await getSupabaseClient();

  const { data, error } = await client
    .from('platform_reviews')
    .select('id, user_id, rating, category, comment, status, admin_response, responded_by, responded_at, created_at, profiles:profiles!left(full_name, email, username)')
    .eq('status', 'responded')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  const reviews: Review[] = ((data as unknown) as Record<string, unknown>[]).map(mapRow);

  return { data: reviews, error: null };
}

export async function listUserReviews(
  userId: string,
): Promise<ServiceResult<Review[]>> {
  if (!hasSupabaseEnv()) {
    return createMissingEnvError();
  }

  const client = await getSupabaseClient();

  const { data, error } = await client
    .from('platform_reviews')
    .select('id, user_id, rating, category, comment, status, admin_response, responded_by, responded_at, created_at, profiles:profiles!left(full_name, email, username)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  const reviews: Review[] = ((data as unknown) as Record<string, unknown>[]).map(mapRow);

  return { data: reviews, error: null };
}

export async function respondToReview(
  callerRole: string,
  callerId: string,
  input: RespondToReviewInput,
): Promise<ServiceResult<Review>> {
  if (callerRole !== 'admin') {
    return { data: null, error: new Error('Unauthorized') };
  }

  if (!hasSupabaseEnv()) {
    return createMissingEnvError();
  }

  const client = await getSupabaseClient();

  const { data, error } = await client
    .from('platform_reviews')
    .update({
      admin_response: input.response,
      responded_by: callerId,
      responded_at: new Date().toISOString(),
      status: 'responded',
    })
    .eq('id', input.reviewId)
    .select('id, user_id, rating, category, comment, status, admin_response, responded_by, responded_at, created_at, profiles:profiles!left(full_name, email, username)')
    .single();

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  return { data: mapRow(data as Record<string, unknown>), error: null };
}

export async function getReviewStats(
  callerRole: string,
): Promise<ServiceResult<{ total: number; pending: number; responded: number; avgRating: number }>> {
  if (callerRole !== 'admin') {
    return { data: null, error: new Error('Unauthorized') };
  }

  if (!hasSupabaseEnv()) {
    return createMissingEnvError();
  }

  const client = await getSupabaseClient();

  const [totalResult, pendingResult, respondedResult, ratingResult] = await Promise.all([
    client.from('platform_reviews').select('*', { count: 'exact', head: true }),
    client.from('platform_reviews').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    client.from('platform_reviews').select('*', { count: 'exact', head: true }).eq('status', 'responded'),
    client.from('platform_reviews').select('rating'),
  ]);

  const { count: total, error: totalError } = totalResult;
  const { count: pending, error: pendingError } = pendingResult;
  const { count: responded, error: respondedError } = respondedResult;
  const { data: ratingData, error: ratingError } = ratingResult;

  if (totalError) {
    return { data: null, error: new Error(totalError.message) };
  }
  if (pendingError) {
    return { data: null, error: new Error(pendingError.message) };
  }
  if (respondedError) {
    return { data: null, error: new Error(respondedError.message) };
  }
  if (ratingError) {
    return { data: null, error: new Error(ratingError.message) };
  }

  const ratings = (ratingData as { rating: number }[] | null) || [];
  const avgRating = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
    : 0;

  return {
    data: {
      total: total || 0,
      pending: pending || 0,
      responded: responded || 0,
      avgRating: Math.round(avgRating * 10) / 10,
    },
    error: null,
  };
}
