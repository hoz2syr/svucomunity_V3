import { createClient, type SupabaseClient, type Session } from '@supabase/supabase-js';
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

export const getCurrentSession = async (): Promise<Session | null> => {
  try {
    const { data } = await getSupabaseClient().auth.getSession();
    return data.session;
  } catch {
    return null;
  }
};

export const refreshCurrentSession = async (): Promise<Session | null> => {
  try {
    const { data } = await getSupabaseClient().auth.refreshSession();
    return data.session;
  } catch {
    return null;
  }
};

export const refreshSession = refreshCurrentSession;

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
    return { data, error };
  } catch (error) {
    return { data: { session: null }, error: toSupabaseError(error) };
  }
};

export type DeleteOwnAccountResult =
  | { ok: true }
  | { ok: false; error: string };
