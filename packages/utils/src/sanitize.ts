import DOMPurify from 'dompurify';

export function sanitizeHTML(dirty: string): string {
  if (!dirty) return '';
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'title', 'rel'],
    ALLOW_DATA_ATTR: false,
  });
}

export function sanitizeText(text: string): string {
  if (!text) return '';
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] });
}

export function sanitizeUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (/^\s*javascript\s*:/i.test(trimmed)) return '';
  if (/^\s*data\s*:/i.test(trimmed)) return '';
  if (/^\s*blob\s*:/i.test(trimmed)) return '';
  if (/^\s*file\s*:/i.test(trimmed)) return '';
  if (/^\s*vbscript\s*:/i.test(trimmed)) return '';
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return '';
    return trimmed;
  } catch {
    return '';
  }
}
