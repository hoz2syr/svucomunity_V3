/**
 * ════════════════════════════════════════════════════════════════
 * SVU Community — Schedule Extraction Service
 * يستدعي Edge Function (ocr-proxy) بدلاً من OCR API مباشرة
 * ════════════════════════════════════════════════════════════════
 */

// ── Helpers ──────────────────────────────────────────────────────

function isNoise(line) {
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

function hasSVUCode(line) {
  return /(?:ITE|ENG|BA|CS)_[A-Z]/i.test(line);
}

function extractCode(line) {
  let m = line.match(/(?:ITE|ENG|BA|CS)_([A-Z]{2,5}\d{2,4})/i);
  if (m) return m[1].toUpperCase();
  let m2 = line.match(/([A-Z]{2,5}\d{2,4})/);
  if (m2) return m2[1].toUpperCase();
  return null;
}

function extractSection(line) {
  let m = line.match(/_C(\d+)_/i);
  return m ? 'C' + m[1] : null;
}

function looksLikeName(line) {
  const cleaned = line.replace(/[^a-zA-Z\u0600-\u06FF\s]/g, '').trim();
  if (cleaned.length < 4 || cleaned.length > 60) return false;
  const words = cleaned.split(/\s+/);
  if (words.length < 2 || words.length > 5) return false;
  return words.every(w => w.length >= 2);
}

function looksLikeInstructor(text) {
  if (!text) return false;
  const cleaned = text.trim();
  const words = cleaned.split(/\s+/);
  if (words.length < 2) return false;
  const allCapitalized = words.every(w => /^[A-Z]/.test(w) && !/\d/.test(w));
  const courseWords = /Systems|Programming|Analysis|Structures|Database|Networks|Engineering|Algorithms|Architecture|Processing|Circuits|Mathematics|Graphics|Applications|Security|Management|Intelligence|Web|Mobile|Operating|Data|Computer/;
  const hasCourseWord = courseWords.test(cleaned);
  return allCapitalized && !hasCourseWord;
}

function lookupCourseName(code) {
  const courses = window.ITE_COURSES;
  if (!courses || !code) return code;
  const upper = code.toUpperCase();
  for (let i = 0; i < courses.length; i++) {
    if (courses[i].code.toUpperCase() === upper) return courses[i].name;
  }
  return code;
}

function parseScheduleText(rawText) {
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const courses = [];
  const seen = {};
  let major = '';

  if (/information\s*technology|ITE\b/i.test(rawText)) major = 'Information Technology';

  const fullCodeRegex = /(?:ITE|ENG|BA|CS)_[A-Z]{2,5}\d{2,4}_C\d+_[A-Z]\d+/i;

  lines.forEach((line, index) => {
    let fullMatch = line.match(fullCodeRegex);
    if (!fullMatch) {
      if (!hasSVUCode(line)) return;
      fullMatch = line.match(/((?:ITE|ENG|BA|CS)_[A-Z]{2,5}\d{2,4})/i);
      if (!fullMatch) return;
    }

    const fullCode = fullMatch[0].toUpperCase();
    const code = extractCode(fullCode);
    if (!code || seen[code]) return;
    seen[code] = true;

    const section = extractSection(fullCode) || extractSection(line);
    let name = '';
    let instructor = null;

    let beforeCode = line.split(fullMatch[0])[0].trim();
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
      name: name || lookupCourseName(code) || code,
      section,
      instructor: instructor || null,
      time: null,
    });
  });

  return { major, courses };
}

// ── OCR via Supabase Edge Function ────────────────────────────────

async function callOCR(base64DataUrl) {
  const db = window.getDb?.();
  if (!db) throw new Error('OCR_API_KEY_NOT_CONFIGURED');

  let response;
  try {
    response = await db.functions.invoke('ocr-proxy', {
      body: { base64Image: base64DataUrl },
    });
  } catch (e) {
    throw new Error('OCR_NETWORK_ERROR: فشل الاتصال بخدمة OCR.');
  }

  const normalizeError = (err) => {
    const msg = typeof err === 'string' ? err : err?.message || '';
    if (msg === 'OCR_QUOTA_EXCEEDED') return new Error('OCR_QUOTA_EXCEEDED');
    if (msg === 'OCR_API_KEY_INVALID') return new Error('OCR_API_KEY_INVALID');
    if (msg === 'OCR_API_KEY_NOT_CONFIGURED') return new Error('OCR_API_KEY_NOT_CONFIGURED');
    if (msg === 'OCR_NO_TEXT') return new Error('OCR_NO_TEXT: لم يتم العثور على نص في الصورة.');
    if (msg.startsWith('OCR_PROCESSING_ERROR')) return new Error(msg);
    return new Error('OCR_ERROR: ' + msg);
  };

  if (response.data?.error) {
    throw normalizeError(response.data.error);
  }

  if (response.error) {
    throw normalizeError(typeof response.error === 'string' ? response.error : response.error?.message || '');
  }

  const data = response.data;
  if (!data?.text) {
    throw new Error('OCR_NO_TEXT: لم يتم العثور على نص في الصورة.');
  }

  return data.text;
}

// ── Public API ───────────────────────────────────────────────────

export function extractScheduleFromImage(base64Image, mimeType) {
  let imageData = base64Image;
  if (!imageData || imageData.length < 100) throw new Error('INVALID_IMAGE_DATA');

  if (!imageData.startsWith('data:')) {
    imageData = 'data:' + (mimeType || 'image/png') + ';base64,' + imageData;
  }

  const rawText = await callOCR(imageData);
  console.debug('[OCR] Extracted text length:', rawText.length);

  const result = parseScheduleText(rawText);
  console.debug('[OCR] Found', result.courses.length, 'courses');

  return result;
}

// Backward-compatible window assignments
window.extractScheduleFromImage = extractScheduleFromImage;
window.isGeminiConfigured = () =>
  typeof window.isSupabaseConfigured === 'function' && window.isSupabaseConfigured();
