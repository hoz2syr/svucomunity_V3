import { getErrorMessage, getSupabaseClient, hasSupabaseEnv, missingSupabaseEnvMessage } from '../lib/supabase';
import { clearAllExamLocalData } from '../lib/examStorage';

const EDGE_FUNCTION_NAME = 'delete-account';
const EDGE_FUNCTION_TIMEOUT_MS = 15_000;

class EdgeFunctionError extends Error {
  constructor(
    message: string,
    public readonly cause: unknown,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = 'EdgeFunctionError';
  }
}

const friendlyArabicFallback =
  'تعذر حذف الحساب حالياً. تحقق من اتصالك بالإنترنت وحاول مرة أخرى.';

const classifyFunctionError = (fnError: { message?: string; status?: number }): string => {
  const message = fnError.message ?? '';
  const status = fnError.status;

  if (message.toLowerCase().includes('network') || message.toLowerCase().includes('fetch')) {
    return 'فشل الاتصال بالخادم. تحقق من اتصالك بالإنترنت.';
  }
  if (message.toLowerCase().includes('edge function')) {
    return 'تعذر الوصول إلى خدمة حذف الحساب. قد تكون الخدمة متوقفة حالياً.';
  }
  if (status === 429) {
    return 'طلبات كثيرة جداً. يرجى الانتظار قليلاً قبل المحاولة مرة أخرى.';
  }
  if (status === 403) {
    return 'لا يمكن حذف حساب الأدمن من هنا.';
  }
  if (status === 401) {
    return 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.';
  }
  if (status && status >= 500) {
    return 'حدث خطأ في الخادم. يرجى المحاولة لاحقاً.';
  }
  return message || friendlyArabicFallback;
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
    const client = await getSupabaseClient();
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

    const invokePromise = client.functions.invoke(EDGE_FUNCTION_NAME, {
      method: 'POST',
    });
    const timeoutPromise = new Promise<never>((_resolve, reject) => {
      const handler = () => {
        reject(
          new EdgeFunctionError(
            'انتهت مهلة الطلب.',
            new Error('Edge Function invocation timed out.'),
            408,
          ),
        );
      };
      setTimeout(handler, EDGE_FUNCTION_TIMEOUT_MS);
    });

    let fnError: { message?: string; status?: number } | null;
    try {
      const result = await Promise.race([invokePromise, timeoutPromise]) as { error: { message?: string; status?: number } };
      fnError = result.error ?? null;
    } catch (error) {
      const isEdgeFunctionError =
        error instanceof EdgeFunctionError ||
        (typeof error === 'object' && error !== null && (error as { name?: string }).name === 'EdgeFunctionError');
      if (isEdgeFunctionError) {
        return { ok: false, error: error instanceof Error ? error.message : friendlyArabicFallback };
      }
      return {
        ok: false,
        error: getErrorMessage(error, friendlyArabicFallback),
      };
    }

    if (fnError) {
      return {
        ok: false,
        error: classifyFunctionError(fnError),
      };
    }

    clearAllExamLocalData(user.id);
    try {
      sessionStorage.removeItem('svu-guest-mode');
      sessionStorage.removeItem('svu-guest-profile');
    } catch {
      // ignore sessionStorage access errors
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: getErrorMessage(error, friendlyArabicFallback),
    };
  }
};

export const signOutCurrentUser = async (): Promise<{ ok: true } | { ok: false; error: string }> => {
  if (!hasSupabaseEnv()) {
    try {
      sessionStorage.removeItem('svu-guest-mode');
      sessionStorage.removeItem('svu-guest-profile');
    } catch { /* ignore */ }
    return { ok: false, error: missingSupabaseEnvMessage };
  }

  try {
    await (await getSupabaseClient()).auth.signOut();
    sessionStorage.removeItem('svu-guest-mode');
    sessionStorage.removeItem('svu-guest-profile');
    return { ok: true };
  } catch (error) {
    try {
      sessionStorage.removeItem('svu-guest-mode');
      sessionStorage.removeItem('svu-guest-profile');
    } catch { /* ignore */ }
    return { ok: false, error: getErrorMessage(error) };
  }
};
