import type { Session } from '@supabase/supabase-js';
import type { SupabaseOperationError, SignInWithGoogleResult, AuthCallbackResult } from '../lib/supabase';
import { classifyAuthFunctionError, extractFnError } from './classifyAuthError';
import { hasSupabaseEnv, getSupabaseClient, signInWithGoogle, handleAuthCallback, createMissingEnvError } from '../lib/supabase';

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

export const loginWithPassword = async (email: string, password: string): Promise<SignInWithPasswordResult> => {
  if (!hasSupabaseEnv()) {
    return { data: null, error: createMissingEnvError() };
  }

  try {
    const client = await getSupabaseClient();
    const { data, error } = await client.functions.invoke('auth-login', {
      body: { email, password },
    });

    if (error || !data?.session) {
      const raw = extractFnError(error, (data as { error?: unknown } | undefined)?.error);
      return {
        data: null,
        error: { message: classifyAuthFunctionError(raw) },
      };
    }

    const { error: setSessionError } = await client.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });

    if (setSessionError) {
      return { data: null, error: { message: classifyAuthFunctionError(setSessionError) } };
    }

    return { data: { user: data.session.user }, error: null };
  } catch (err) {
    return { data: null, error: { message: classifyAuthFunctionError(err as { message?: string }) } };
  }
};

export const registerWithEmail = async (name: string, email: string, password: string): Promise<SignUpWithEmailResult> => {
  if (!hasSupabaseEnv()) {
    return { data: null, error: createMissingEnvError() };
  }

  try {
    const client = await getSupabaseClient();
    const { data, error } = await client.functions.invoke('auth-register', {
      body: { name, email, password },
    });

    if (error || data?.error) {
      const raw = extractFnError(error, (data as { error?: unknown } | undefined)?.error);
      return {
        data: null,
        error: { message: classifyAuthFunctionError(raw) },
      };
    }

    if (data?.session) {
      const { error: setSessionError } = await client.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });
      if (setSessionError) {
        return { data: null, error: { message: classifyAuthFunctionError(setSessionError) } };
      }
    }

    return { data: { user: data?.data?.user }, error: null };
  } catch (err) {
    return { data: null, error: { message: classifyAuthFunctionError(err as { message?: string }) } };
  }
};

export const loginWithGoogle = async (): Promise<SignInWithGoogleResult> => {
  if (!hasSupabaseEnv()) {
    return { data: null, error: createMissingEnvError() };
  }

  try {
    const result = await signInWithGoogle();
    if (result.error) {
      return {
        data: null,
        error: { message: classifyAuthFunctionError(result.error) },
      };
    }
    return result;
  } catch (error) {
    return { data: null, error: { message: classifyAuthFunctionError(error as { message?: string }) } };
  }
};

export const resetPassword = async (email: string): Promise<ResetPasswordResult> => {
  if (!hasSupabaseEnv()) {
    return { data: null, error: createMissingEnvError() };
  }

  try {
    const client = await getSupabaseClient();
    const { data, error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    if (error) {
      return { data: null, error: { message: classifyAuthFunctionError(error) } };
    }
    return { data, error: null };
  } catch (error) {
    return { data: null, error: { message: classifyAuthFunctionError(error as { message?: string }) } };
  }
};

export const completeAuthCallback = async (): Promise<AuthCallbackResult> => {
  if (!hasSupabaseEnv()) {
    return { data: { session: null }, error: createMissingEnvError() };
  }

  try {
    const result = await handleAuthCallback();
    if (result.error) {
      return { data: { session: null }, error: { message: classifyAuthFunctionError(result.error) } };
    }
    return result as AuthCallbackResult;
  } catch (error) {
    return { data: { session: null }, error: { message: classifyAuthFunctionError(error as { message?: string }) } };
  }
};

export const listenAuthChanges = async (callback: (session: Session | null) => void) => {
  const client = await getSupabaseClient();
  const {
    data: { subscription },
  } = client.auth.onAuthStateChange((_event: string, session: Session | null) => {
    callback(session);
  });

  return {
    unsubscribe: subscription.unsubscribe,
  };
};
