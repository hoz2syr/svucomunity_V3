import { describe, it, expect, vi, beforeEach } from 'vitest';

import { buildPhone } from '../js/modules/page-register/register-ui.js';
import { state as modState, getCurrentLang, MAJORS, resolveDb, fetchMajors } from '../js/modules/page-register/register-state.js';

beforeEach(() => {
  modState.selected = { dial: '+963', localPfx: ['0'], flag: '🇸🇾', code: 'SY', name: { ar: 'سوريا', en: 'Syria' }, minLen: 9, maxLen: 10 };
});

describe('buildPhone', () => {
  it('builds Syria local number without prefix', () => {
    expect(buildPhone('0933123456')).toBe('+963933123456');
  });

  it('builds Syria international +963 without local 0', () => {
    expect(buildPhone('+963933123456')).toBe('+963933123456');
  });

  it('does not strip the first 9 from +963 input', () => {
    expect(buildPhone('+963933123456')).not.toBe('+96393123456');
  });

  it('builds 00-prefixed international number', () => {
    expect(buildPhone('00963933123456')).toBe('+963933123456');
  });

  it('handles country without localPfx (bare dial)', () => {
    modState.selected = { dial: '+966', localPfx: [], flag: '🇸🇦', code: 'SA', name: { ar: 'السعودية', en: 'Saudi Arabia' }, minLen: 9, maxLen: 12 };
    expect(buildPhone('551234567')).toBe('+966551234567');
    expect(buildPhone('+966551234567')).toBe('+966551234567');
  });

  it('handles empty input', () => {
    expect(buildPhone('')).toBe('+963');
    expect(buildPhone('   ')).toBe('+963');
  });

  it('strips non-digits from mixed input', () => {
    expect(buildPhone('09-331-2345-6')).toBe('+963933123456');
  });
});
