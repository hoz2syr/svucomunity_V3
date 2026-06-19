import { getErrorMessage, getSupabaseClient, hasSupabaseEnv, missingSupabaseEnvMessage } from '../lib/supabase';

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

export const signOutCurrentUser = async (): Promise<{ ok: true } | { ok: false; error: string }> => {
  if (!hasSupabaseEnv()) {
    return { ok: false, error: missingSupabaseEnvMessage };
  }

  try {
    await getSupabaseClient().auth.signOut();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: getErrorMessage(error) };
  }
};
