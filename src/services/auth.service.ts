import type { Session } from '@supabase/supabase-js';
import { handleAuthCallback as libHandleAuthCallback, hasSupabaseEnv, missingSupabaseEnvMessage } from '../lib/supabase';
import type { SupabaseOperationError } from '../types/supabase';

export type AuthCallbackResult = {
  data: {
    session: Session | null;
  };
  error: SupabaseOperationError | null;
};

export type SignInWithGoogleResult = {
  data: unknown;
  error: SupabaseOperationError | null;
};

export type SignInWithPasswordResult = {
  data: unknown;
  error: SupabaseOperationError | null;
};

export type SignUpWithEmailResult = {
  data: unknown;
  error: SupabaseOperationError | null;
};

export type ResetPasswordResult = {
  data: unknown;
  error: SupabaseOperationError | null;
};

const createMissingEnvError = (): SupabaseOperationError => ({
  message: missingSupabaseEnvMessage,
});

const toSupabaseError = (error: unknown): SupabaseOperationError => ({
  message: error instanceof Error ? error.message : String(error),
});

export const loginWithPassword = async (email: string, password: string): Promise<SignInWithPasswordResult> => {
  if (!hasSupabaseEnv()) {
    return { data: null, error: createMissingEnvError() };
  }

  try {
    const client = await import('../lib/supabase').then((m) => m.getSupabaseClient());
    const { data, error } = await client.functions.invoke('auth-login', {
      body: { email, password },
    });

    if (error || !data?.session) {
      return {
        data: null,
        error: { message: data?.error || error?.message || 'فشل تسجيل الدخول.' },
      };
    }

    const { error: setSessionError } = await client.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });

    if (setSessionError) {
      return { data: null, error: toSupabaseError(setSessionError) };
    }

    return { data: { user: data.session.user }, error: null };
  } catch (err) {
    return { data: null, error: toSupabaseError(err) };
  }
};

export const registerWithEmail = async (name: string, email: string, password: string): Promise<SignUpWithEmailResult> => {
  if (!hasSupabaseEnv()) {
    return { data: null, error: createMissingEnvError() };
  }

  try {
    const client = await import('../lib/supabase').then((m) => m.getSupabaseClient());
    const { data, error } = await client.functions.invoke('auth-register', {
      body: { name, email, password },
    });

    if (error || data?.error) {
      return {
        data: null,
        error: { message: data?.error || error?.message || 'فشل إنشاء الحساب.' },
      };
    }

    if (data?.session) {
      const { error: setSessionError } = await client.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });
      if (setSessionError) {
        return { data: null, error: toSupabaseError(setSessionError) };
      }
    }

    return { data: { user: data?.data?.user }, error: null };
  } catch (err) {
    return { data: null, error: toSupabaseError(err) };
  }
};

export const loginWithGoogle = async (): Promise<SignInWithGoogleResult> => {
  if (!hasSupabaseEnv()) {
    return { data: null, error: createMissingEnvError() };
  }

  try {
    const { signInWithGoogle } = await import('../lib/supabase');
    return await signInWithGoogle();
  } catch (error) {
    return { data: null, error: toSupabaseError(error) };
  }
};

export const resetPassword = async (email: string): Promise<ResetPasswordResult> => {
  if (!hasSupabaseEnv()) {
    return { data: null, error: createMissingEnvError() };
  }

  try {
    const client = await import('../lib/supabase').then((m) => m.getSupabaseClient());
    const { data, error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    return { data, error };
  } catch (error) {
    return { data: null, error: toSupabaseError(error) };
  }
};

export const completeAuthCallback = async (): Promise<AuthCallbackResult> => {
  if (!hasSupabaseEnv()) {
    return { data: { session: null }, error: createMissingEnvError() };
  }

  try {
    const result = await libHandleAuthCallback();
    return result as AuthCallbackResult;
  } catch (error) {
    return { data: { session: null }, error: toSupabaseError(error) };
  }
};

export const listenAuthChanges = async (callback: (session: Session | null) => void) => {
  const client = (await import('../lib/supabase')).getSupabaseClient();
  const {
    data: { subscription },
  } = client.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });

  return {
    unsubscribe: subscription.unsubscribe,
  };
};
