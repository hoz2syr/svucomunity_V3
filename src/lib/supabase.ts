import type { SupabaseClient, Session } from '@supabase/supabase-js';
import type { SupabaseOperationError } from '../types/supabase';
import { hasSupabaseEnv, missingSupabaseEnvMessage, getErrorMessage } from './env';
export { hasSupabaseEnv, missingSupabaseEnvMessage, getErrorMessage, createMissingEnvError };
export type { SupabaseOperationError };

type EnvConfig = {
  url: string;
  anonKey: string;
};

const readEnv = (): EnvConfig | null => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return { url, anonKey };
};

const ensureSupabaseEnv = (): EnvConfig => {
  const currentEnv = readEnv();
  if (!currentEnv) {
    throw new Error(missingSupabaseEnvMessage);
  }
  return currentEnv;
};

let _supabase: SupabaseClient | null = null;

export const getSupabaseClient = async (): Promise<SupabaseClient> => {
  if (!_supabase) {
    const currentEnv = ensureSupabaseEnv();
    const { createClient } = await import('@supabase/supabase-js');
    _supabase = createClient(currentEnv.url, currentEnv.anonKey);
  }
  return _supabase;
};

export const getCurrentSession = async (): Promise<Session | null> => {
  try {
    const client = await getSupabaseClient();
    const { data } = await client.auth.getSession();
    return data.session;
  } catch {
    return null;
  }
};

export const refreshCurrentSession = async (): Promise<Session | null> => {
  try {
    const client = await getSupabaseClient();
    const { data } = await client.auth.refreshSession();
    return data.session;
  } catch {
    return null;
  }
};

export const refreshSession = refreshCurrentSession;

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
    const client = await getSupabaseClient();
    const { data, error } = await client.auth.signInWithOAuth({
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
    session: Session | null;
  };
  error: SupabaseOperationError | null;
};

export const handleAuthCallback = async (): Promise<AuthCallbackResult> => {
  if (!hasSupabaseEnv()) {
    return { data: { session: null }, error: createMissingEnvError() };
  }

  try {
    const client = await getSupabaseClient();
    const { data, error } = await client.auth.getSession();
    return { data, error };
  } catch (error) {
    return { data: { session: null }, error: toSupabaseError(error) };
  }
};

export type DeleteOwnAccountResult =
  | { ok: true }
  | { ok: false; error: string };
