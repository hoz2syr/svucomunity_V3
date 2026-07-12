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
  const { data, error } = await supabase.functions.invoke<Record<string, unknown>>(OCR_FUNCTION, {
    body: { base64Image: base64DataUrl },
  });

  if (error) {
    const msg = error.message || '';
    if (msg.includes('quota') || msg === 'OCR_QUOTA_EXCEEDED') throw new Error('OCR_QUOTA_EXCEEDED');
    if (msg.includes('key') || msg.includes('invalid') || msg === 'OCR_API_KEY_INVALID') throw new Error('OCR_API_KEY_INVALID');
    if (msg === 'OCR_NO_TEXT') throw new Error('OCR_NO_TEXT: لم يتم العثور على نص في الصورة.');
    if (msg.includes('network') || msg.includes('fetch') || msg.includes('Network')) throw new Error('OCR_NETWORK_ERROR: فشل الاتصال بخدمة OCR.');
    if (msg.includes('processing') || msg.includes('OCR_PROCESSING_ERROR')) throw new Error(msg);
    if (msg === 'OCR_API_KEY_NOT_CONFIGURED') throw new Error('OCR_API_KEY_NOT_CONFIGURED');
    throw new Error(msg || 'OCR_ERROR');
  }

  if (data && typeof data === 'object' && 'error' in data) {
    const errMsg = (data as { error: string }).error;
    if (errMsg === 'OCR_QUOTA_EXCEEDED') throw new Error('OCR_QUOTA_EXCEEDED');
    if (errMsg === 'OCR_API_KEY_INVALID') throw new Error('OCR_API_KEY_INVALID');
    if (errMsg === 'OCR_API_KEY_NOT_CONFIGURED') throw new Error('OCR_API_KEY_NOT_CONFIGURED');
    if (errMsg === 'OCR_NO_TEXT') throw new Error('OCR_NO_TEXT: لم يتم العثور على نص في الصورة.');
    throw new Error(errMsg);
  }

  const text = (data as { text?: string })?.text;
  if (!text) {
    throw new Error('OCR_NO_TEXT: لم يتم العثور على نص في الصورة.');
  }

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
  if (/information\s*technology|ITE\b/i.test(rawText)) return 'ITE (Information Technology Engineering)';
  if (/engineering/i.test(rawText)) return 'ENG (Engineering)';
  if (/business|BA\b|BBA\b/i.test(rawText)) return 'BA (Business Administration)';
  if (/computer\s*science|CS\b/i.test(rawText)) return 'CS (Computer Science)';
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
      time: null,
    });
  });

  return { rawText, major, courses };
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
