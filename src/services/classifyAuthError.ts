const classifyAuthFunctionError = (
  raw: { message?: string; status?: number } | null | undefined,
  fallback = 'حدث خطأ غير متوقع. حاول مرة أخرى.',
): string => {
  if (!raw) return fallback;
  const message = (raw.message ?? '').toLowerCase();
  const status = raw.status;

  if (import.meta.env.DEV) {
    console.error('[AuthError]', raw);
  }

  if (status === 401 || message.includes('invalid credentials') || message.includes('invalid login') || message.includes('invalid email or password')) {
    return 'بريد إلكتروني أو كلمة مرور غير صحيحة.';
  }
  if (message.includes('user not found') || message.includes('no user found')) {
    return 'لا يوجد حساب بهذا البريد الإلكتروني.';
  }
  if (message.includes('email not confirmed')) {
    return 'يرجى تفعيل حسابك عبر رابط التأكيد المرسل إلى بريدك الإلكتروني.';
  }
  if (message.includes('user already registered') || message.includes('already been registered') || message.includes('email already exists') || message.includes('duplicate key')) {
    return 'هذا البريد الإلكتروني مسجل مسبقاً.';
  }
  if (message.includes('password must be at least')) {
    return 'كلمة المرور قصيرة جداً. يجب أن تكون 8 أحرف على الأقل.';
  }
  if (status === 429 || message.includes('too many attempts') || message.includes('rate limit')) {
    return 'طلبات كثيرة جداً. يرجى الانتظار قليلاً قبل المحاولة مرة أخرى.';
  }
  if (status === 403 || message.includes('forbidden') || message.includes('permission denied')) {
    return 'ليس لديك صلاحية كافية. يرجى التحقق من إعدادات التطبيق.';
  }
  if (status === 404 || message.includes('not found')) {
    return 'خدمة المصادقة غير متاحة حالياً. يرجى المحاولة لاحقاً.';
  }
  if (status && status >= 500) {
    return 'حدث خطأ في الخادم. يرجى المحاولة لاحقاً.';
  }
  if (message.includes('network') || message.includes('fetch failed')) {
    return 'فشل الاتصال بالخادم. تحقق من اتصالك بالإنترنت.';
  }

  const statusMatch = message.match(/non-2xx\s*(?:status\s*code)?[\s:]*(\d{3})/);
  if (statusMatch) {
    const code = parseInt(statusMatch[1], 10);
    if (code === 401) return 'بريد إلكتروني أو كلمة مرور غير صحيحة.';
    if (code === 403) return 'ليس لديك صلاحية كافية. يرجى التحقق من إعدادات التطبيق.';
    if (code === 404) return 'خدمة المصادقة غير متاحة حالياً.';
    if (code === 429) return 'طلبات كثيرة جداً. يرجى الانتظار قليلاً.';
    if (code >= 500) return 'حدث خطأ في الخادم. يرجى المحاولة لاحقاً.';
    return `طلب مرفوض (كود الخطأ: ${code}). يرجى المحاولة لاحقاً.`;
  }

  const specificError = message.replace(/.*edge function\s*[-:]?\s*/i, '').trim();
  if (specificError && specificError !== message) {
    return specificError;
  }

  if (message.includes('edge function')) {
    return 'تعذر الوصول إلى خدمة المصادقة. قد تكون الخدمة متوقفة حالياً.';
  }

  return fallback;
};

export const extractFnError = (
  supabaseError: { message?: string; status?: number } | null | undefined,
  dataFallback: unknown,
): { message?: string; status?: number } | null => {
  if (supabaseError) return supabaseError;
  if (typeof dataFallback === 'string') return { message: dataFallback };
  if (dataFallback && typeof dataFallback === 'object') {
    const obj = dataFallback as Record<string, unknown>;
    if (typeof obj.error === 'string') return { message: obj.error };
    if (typeof obj.error === 'object' && obj.error !== null) {
      const errObj = obj.error as { message?: string; status?: number };
      return { message: errObj.message, status: errObj.status };
    }
  }
  return null;
};

export { classifyAuthFunctionError };
