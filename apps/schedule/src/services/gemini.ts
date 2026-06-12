/**
 * ════════════════════════════════════════════════════════════════
 * Gemini AI Service — via Supabase Edge Function Proxy
 * المفتاح محمي على الخادم ولا يُعرض للعميل أبداً
 * ════════════════════════════════════════════════════════════════
 */
import type { Course, ExtractionResult } from './types';

interface SupabaseFunctionsClient {
  functions: {
    invoke: (
      name: string,
      options: Record<string, unknown>
    ) => Promise<{ data: unknown; error: unknown }>;
  };
}

interface GeminiResponse {
  major?: string;
  courses?: unknown;
}

function normalizeCourses(raw: unknown): Course[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item: Record<string, unknown>) => ({
      code: String(item.code ?? '')
        .toUpperCase()
        .trim(),
      name: String(item.name ?? '').trim(),
      section: item.section != null ? String(item.section).trim() : undefined,
      instructor: item.instructor != null ? String(item.instructor).trim() : undefined,
      time: item.time != null ? String(item.time).trim() : undefined,
    }))
    .filter((c) => c.code.length > 0 && c.name.length > 0);
}

export async function extractScheduleFromImage(
  base64Image: string,
  mimeType: string,
  supabaseClient: SupabaseFunctionsClient,
  signal?: AbortSignal
): Promise<ExtractionResult> {
  if (!base64Image || base64Image.length < 1000) {
    throw new Error('INVALID_IMAGE_DATA: بيانات الصورة غير صالحة أو قصيرة جداً.');
  }

  const imageData = base64Image.startsWith('data:')
    ? base64Image
    : `data:${mimeType || 'image/png'};base64,${base64Image}`;

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('GEMINI_TIMEOUT: تجاوز الوقت المسموح لمعالجة الصورة.')), 30000);
  });

  const invokePromise = supabaseClient.functions.invoke('gemini-proxy', {
    body: { base64Image: imageData },
    ...(signal ? { signal } : {}),
  });

  const resolve = await Promise.race([invokePromise, timeoutPromise]) as { data: unknown; error: unknown };
  const { data, error } = resolve;

  if (error) {
    const errMsg = typeof error === 'string' ? error : (error as { message?: string }).message || '';
    if (errMsg === 'GEMINI_QUOTA_EXCEEDED') throw new Error('GEMINI_QUOTA_EXCEEDED');
    if (errMsg === 'GEMINI_API_KEY_INVALID') throw new Error('GEMINI_API_KEY_INVALID');
    if (errMsg.startsWith('GEMINI_PROCESSING_ERROR')) throw new Error(errMsg);
    throw new Error(`GEMINI_ERROR: ${errMsg || 'فشل في معالجة الصورة'}`);
  }

  const result = data as GeminiResponse;

  if (!result || !Array.isArray(result.courses)) {
    throw new Error('GEMINI_NO_DATA: لم يتم استخراج بيانات من الصورة.');
  }

  return {
    major: result.major?.trim() || 'Not specified',
    courses: normalizeCourses(result.courses ?? []),
  };
}
