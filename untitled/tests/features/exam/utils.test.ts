import { describe, it, expect, beforeEach, vi } from 'vitest';
import { escapeHtml } from '../../../src/features/exam/src/lib/utils';

describe('escapeHtml', () => {
  it('returns empty string for undefined', () => {
    expect(escapeHtml(undefined as unknown as string)).toBe('');
  });

  it('escapes ampersand', () => {
    expect(escapeHtml('a & b')).toBe('a &amp; b');
  });

  it('escapes less-than and greater-than', () => {
    expect(escapeHtml('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  it('escapes double and single quotes', () => {
    expect(escapeHtml('say "hello" and \'bye\'')).toBe('say &quot;hello&quot; and &#039;bye&#039;');
  });

  it('returns original string when no special chars', () => {
    expect(escapeHtml('مرحبا بالعالم')).toBe('مرحبا بالعالم');
  });
});
