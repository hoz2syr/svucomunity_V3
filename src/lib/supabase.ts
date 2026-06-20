import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';
import type { Profile } from '../types/profile';
import type { SupabaseOperationError } from '../types/supabase';

type EnvConfig = {
  url: string;
  anonKey: string;
};

export const missingSupabaseEnvMessage =
  'Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local';

const readEnv = (): EnvConfig | null => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return { url, anonKey };
};

export const hasSupabaseEnv = (): boolean => readEnv() !== null;

const ensureSupabaseEnv = (): EnvConfig => {
  const currentEnv = readEnv();
  if (!currentEnv) {
    throw new Error(missingSupabaseEnvMessage);
  }
  return currentEnv;
};

let _supabase: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient => {
  const currentEnv = ensureSupabaseEnv();
  if (!_supabase) {
    _supabase = createClient(currentEnv.url, currentEnv.anonKey);
  }
  return _supabase;
};

export const getErrorMessage = (error: unknown, fallback = 'حدث خطأ غير متوقع.'): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return fallback;
};

const createMissingEnvError = (): SupabaseOperationError => ({
  message: missingSupabaseEnvMessage,
});

const toSupabaseError = (error: unknown): SupabaseOperationError => ({
  message: getErrorMessage(error),
});

export type UpsertProfileResult = {
  data: Profile | null;
  error: SupabaseOperationError | null;
};

export const upsertProfile = async (user: User): Promise<UpsertProfileResult> => {
  if (!hasSupabaseEnv()) {
    return { data: null, error: createMissingEnvError() };
  }

  try {
    const { data, error } = await getSupabaseClient()
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: user.user_metadata.full_name || user.email || '',
        email: user.email,
        username: user.user_metadata.username || user.email?.split('@')[0] || '',
        role: 'student',
        provider: user.app_metadata.provider || 'email',
        provider_id: user.app_metadata.provider_id || null,
      })
      .select()
      .single();

    if (error) {
      // Structured logging for production — consider integrating with a proper
      // error tracking service (e.g. Sentry) to avoid leaking sensitive data to the browser console.
    }

    return { data: (data as Profile | null) ?? null, error };
  } catch (error) {
    const supabaseError = toSupabaseError(error);
    return { data: null, error: supabaseError };
  }
};

export type SignInWithGoogleResult = {
  data: unknown;
  error: SupabaseOperationError | null;
};

export const signInWithGoogle = async (): Promise<SignInWithGoogleResult> => {
  if (!hasSupabaseEnv()) {
    return { data: null, error: createMissingEnvError() };
  }

  try {
    const { data, error } = await getSupabaseClient().auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    return { data, error };
  } catch (error) {
    return { data: null, error: toSupabaseError(error) };
  }
};

export type AuthCallbackResult = {
  data: {
    session: import('@supabase/supabase-js').Session | null;
  };
  error: SupabaseOperationError | null;
};

export const handleAuthCallback = async (): Promise<AuthCallbackResult> => {
  if (!hasSupabaseEnv()) {
    return { data: { session: null }, error: createMissingEnvError() };
  }

  try {
    const { data, error } = await getSupabaseClient().auth.getSession();

    if (!error && data.session?.user) {
      if (data.session.user.email_confirmed_at) {
        const { error: profileWriteError } = await getSupabaseClient()
          .from('profiles')
          .upsert({
            id: data.session.user.id,
            full_name: data.session.user.user_metadata.full_name || data.session.user.email || '',
            email: data.session.user.email,
            username: data.session.user.user_metadata.username || data.session.user.email?.split('@')[0] || '',
            role: 'student',
            provider: data.session.user.app_metadata.provider || 'email',
            provider_id: data.session.user.app_metadata.provider_id || null,
          })
          .select()
          .single();
        if (profileWriteError && profileWriteError.code !== '23505' && profileWriteError.message?.includes('row-level security')) {
          return { data, error: new SupabaseOperationError('PROFILE_RLS_BLOCKED', profileWriteError.message) };
        }
      }
    }

    return { data, error };
  } catch (error) {
    return { data: { session: null }, error: toSupabaseError(error) };
  }
};

export type DeleteOwnAccountResult =
  | { ok: true }
  | { ok: false; error: string };

export const deleteOwnAccount = async (): Promise<DeleteOwnAccountResult> => {
  if (!hasSupabaseEnv()) {
    return {
      ok: false,
      error: missingSupabaseEnvMessage,
    };
  }

  try {
    const client = getSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await client.auth.getUser();

    if (userError || !user) {
      return {
        ok: false,
        error: userError?.message || 'تعذر التحقق من الجلسة الحالية.',
      };
    }

    const { error: fnError } = await client.functions.invoke('delete-account');

    if (fnError) {
      return {
        ok: false,
        error: fnError.message || 'فشل حذف الحساب من المصادقة.',
      };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: getErrorMessage(error),
    };
  }
};
