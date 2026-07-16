import { getSupabase } from '@/src/features/study-groups/services/studyGroup.supabase';
import type { ExtractedCourse } from '../types';

export interface OCRResult {
  rawText: string;
  major: string;
  courses: ExtractedCourse[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

const OCR_FUNCTION = 'ocr-proxy';

async function callOCR(base64DataUrl: string): Promise<string> {
  const supabase = await getSupabase();
  console.log('[ocrParser] Calling OCR function, image length:', base64DataUrl.length);

  const { data, error } = await supabase.functions.invoke<Record<string, unknown>>(OCR_FUNCTION, {
    body: { base64Image: base64DataUrl },
  });

  console.log('[ocrParser] OCR response - error:', error, 'data:', data);

  if (error || data?.error) {
    const errMsg = typeof data?.error === 'string' ? data.error : error?.message || '';
    const status = error?.status;

    console.error('[ocrParser] OCR failed - status:', status, 'message:', errMsg);

    if (errMsg.includes('OCR_API_KEY_NOT_CONFIGURED')) {
      throw new Error('خطأ في إعداد خدمة OCR. يرجى المحاولة لاحقاً.');
    }
    if (errMsg.includes('quota') || errMsg.includes('limit') || status === 429) {
      throw new Error('تم تجاوز الحد المسموح من طلبات المعالجة. يرجى المحاولة لاحقاً.');
    }
    if (errMsg.includes('key') || errMsg.includes('invalid') || status === 401) {
      throw new Error('خطأ في مصادقة خدمة OCR. يرجى المحاولة لاحقاً.');
    }
    if (errMsg.includes('OCR_NO_TEXT') || status === 422) {
      throw new Error('لم يتم العثور على نص في الصورة. تأكد من أن الصورة واضحة وتحتوي على جدول.');
    }
    if (errMsg.includes('OCR_UPSTREAM_ERROR') || errMsg.includes('network') || errMsg.includes('fetch') || status === 502) {
      throw new Error('فشل الاتصال بخدمة المعالجة. تحقق من الإنترنت.');
    }
    if (errMsg.includes('OCR_PROCESSING_ERROR') || status === 500) {
      throw new Error(`OCR_PROCESSING_ERROR: خطأ في معالجة الصورة. ${errMsg ? 'التفاصيل: ' + errMsg : ''}`);
    }
    throw new Error(errMsg || `OCR_ERROR: Edge Function returned status ${status}`);
  }

  const text = (data as { text?: string })?.text;
  if (!text) {
    console.warn('[ocrParser] OCR response missing text field, data:', data);
    throw new Error('لم يتم العثور على نص في الصورة.');
  }

  console.log('[ocrParser] OCR success, text length:', text.length);
  return text;
}

function isNoise(line: string): boolean {
  const t = line.trim();
  if (t.length < 2) return true;
  if (/^t[_]?\w+$/i.test(t)) return true;
  if (/^S?\d{1,2}$/i.test(t)) return true;
  if (/^\$\d+/.test(t)) return true;
  if (/^\d{1,2}$/.test(t)) return true;
  if (/^\w+_\w+_\w+/.test(t) && !/ITE_|ENG_|BA_|CS_/.test(t)) return true;
  if (/^_C\d+_\$\d+$/i.test(t)) return true;
  if (/^_[A-Z]\d+_\$/i.test(t)) return true;
  return false;
}

function hasSVUCode(line: string): boolean {
  return /(?:ITE|ENG|BA|CS)_[A-Z]/i.test(line);
}

function extractSection(line: string): string | null {
  const m = line.match(/_C(\d+)_/i);
  return m ? 'C' + m[1] : null;
}

function looksLikeInstructor(text: string): boolean {
  if (!text) return false;
  const cleaned = text.trim();
  const words = cleaned.split(/\s+/);
  if (words.length < 2) return false;
  const allCapitalized = words.every((w) => /^[A-Z]/.test(w) && !/\d/.test(w));
  const courseWords = /Systems|Programming|Analysis|Structures|Database|Networks|Engineering|Algorithms|Architecture|Processing|Circuits|Mathematics|Graphics|Applications|Security|Management|Intelligence|Web|Mobile|Operating|Data|Computer/i;
  const hasCourseWord = courseWords.test(cleaned);
  return allCapitalized && !hasCourseWord;
}

function detectMajor(rawText: string): string {
  if (/information\s*technology|ITE[\s_]|ITE$/i.test(rawText)) return 'ITE (Information Technology Engineering)';
  if (/engineering/i.test(rawText)) return 'ENG (Engineering)';
  if (/business|BA\b|BBA\b/i.test(rawText)) return 'BA (Business Administration)';
  if (/computer\s*science|CS\b/i.test(rawText)) return 'CS (Computer Science)';
  return '';
}

function detectMajorFromCode(fullCode: string): string {
  const upper = fullCode.toUpperCase();
  if (upper.startsWith('ITE_')) return 'ITE (Information Technology Engineering)';
  if (upper.startsWith('ENG_')) return 'ENG (Engineering)';
  if (upper.startsWith('BA_') || upper.startsWith('BBA_')) return 'BA (Business Administration)';
  if (upper.startsWith('CS_')) return 'CS (Computer Science)';
  return '';
}

function parseScheduleText(rawText: string): OCRResult {
  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const courses: ExtractedCourse[] = [];
  const seen: Record<string, boolean> = {};
  const major = detectMajor(rawText);

  const fullCodeRegex = /(?:ITE|ENG|BA|CS)_[A-Z]{2,5}\d{2,4}_C\d+_[A-Z]\d+/i;

  lines.forEach((line, index) => {
    let fullMatch = line.match(fullCodeRegex);
    if (!fullMatch) {
      if (!hasSVUCode(line)) return;
      fullMatch = line.match(/((?:ITE|ENG|BA|CS)_[A-Z]{2,5}\d{2,4})/i);
      if (!fullMatch) return;
    }

    const fullCode = fullMatch[0].toUpperCase();
    const codeMatch = fullCode.match(/(?:ITE|ENG|BA|CS)_([A-Z]{2,5}\d{2,4})/i);
    if (!codeMatch) return;
    const code = codeMatch[1].toUpperCase();
    if (!code || seen[code]) return;
    seen[code] = true;

    const section = extractSection(fullCode) || extractSection(line);
    let name = '';
    let instructor: string | null = null;
    let instructorUsername: string | null = null;

    const usernameMatch = line.match(/t_([A-Za-z0-9_]+)/i);
    if (usernameMatch) {
      instructorUsername = 't_' + usernameMatch[1];
    }

    const semesterMatch = fullCode.match(/_([A-Z]\d+)$/);
    const semester = semesterMatch ? semesterMatch[1] : null;

    const beforeCode = line.split(fullMatch[0])[0].trim();
    name = beforeCode.replace(/S\d{2}/g, '').replace(/^\d+\s+/, '').trim();
    name = name.replace(/t_\w+/gi, '').replace(/_C\d+_\$\d+/gi, '').trim();

    if (looksLikeInstructor(name)) {
      instructor = name;
      name = '';
    }

    if (!name && index > 0) {
      const prev = lines[index - 1];
      if (!fullCodeRegex.test(prev) && !hasSVUCode(prev) && !isNoise(prev)) {
        const prevClean = prev.replace(/S\d{2}/g, '').replace(/t_\w+/gi, '').replace(/_C\d+_\$\d+/gi, '').trim();
        if (!looksLikeInstructor(prevClean)) {
          name = prevClean;
        } else if (!instructor) {
          instructor = prevClean;
        }
      }
    }

    if (!instructor) {
      const afterCode = line.split(fullMatch[1] || fullMatch[0])[1] || '';
      instructor = afterCode.replace(/t_\w+/gi, '').replace(/_C\d+_\$\d+/gi, '').replace(/[|،,]+$/g, '').trim();
    }

    if (!instructor && index < lines.length - 1) {
      const nextLine = lines[index + 1];
      if (!fullCodeRegex.test(nextLine) && !hasSVUCode(nextLine) && !isNoise(nextLine)) {
        instructor = nextLine.replace(/t_\w+/gi, '').replace(/_C\d+_\$\d+/gi, '').trim();
      }
    }

    if (instructor && /^[_$C\d\s\-]+$/i.test(instructor)) {
      instructor = null;
    }

    courses.push({
      code,
      name: name || code,
      section,
      instructor: instructor || null,
      instructor_username: instructorUsername,
      course_key: code,
      semester,
      major: null,
      time: null,
    });
  });

  const detectedMajor = major || detectMajorFromCode(courses[0]?.course_key || '');

  return { rawText, major: detectedMajor, courses };
}

export async function extractScheduleFromImage(
  base64Image: string,
  mimeType: string
): Promise<{ result: OCRResult; validation: ValidationResult }> {
  if (!base64Image || base64Image.length < 100) {
    throw new Error('INVALID_IMAGE_DATA');
  }

  const imageData = base64Image.startsWith('data:')
    ? base64Image
    : `data:${mimeType || 'image/png'};base64,${base64Image}`;

  const rawText = await callOCR(imageData);

  const parsed = parseScheduleText(rawText);

  const errors: string[] = [];
  const warnings: string[] = [];

  if (parsed.courses.length === 0) {
    errors.push('لم يتم العثور على مواد دراسية في الصورة');
  }

  if (!parsed.major) {
    warnings.push('لم يتم تحديد التخصص تلقائياً');
  }

  const validation = {
    valid: errors.length === 0,
    errors,
    warnings,
  };

  return { result: parsed, validation };
}

