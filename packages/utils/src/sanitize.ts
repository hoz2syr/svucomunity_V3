export function sanitizeHTML(dirty: string): string {
  const ALLOWED_TAGS = ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'] as const;
  const ALLOWED_ATTR = ['href', 'title', 'rel'] as const;
  if (!dirty) return '';
  const cleaned = dirty
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/on\w+:\s*[^;]*/g, '');
  return cleaned;
}

export function sanitizeText(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
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
    new URL(trimmed);
    if (/^https?:/i.test(trimmed)) return trimmed;
    return '';
  } catch {
    return '';
  }
}
