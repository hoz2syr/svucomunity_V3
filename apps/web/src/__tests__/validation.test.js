import { describe, it, expect } from 'vitest';
import {
  validateUsername,
  validateMajor,
  validatePhone,
  validatePassword,
  formatFieldError,
  calcStrength,
} from '../js/modules/page-register/validation.js';

const COUNTRY_SY = { code: 'SY', dial: '+963', minLen: 9, maxLen: 10, localPfx: ['0'] };

describe('validation', () => {
  it('validateUsername rejects invalid format', () => {
    expect(validateUsername('invalid')).toBeTruthy();
    expect(validateUsername('ahmed_123')).toBeTruthy();
    expect(validateUsername('123_ahmed')).toBeTruthy();
    expect(validateUsername('')).toBeTruthy();
  });

  it('validateUsername accepts valid format', () => {
    expect(validateUsername('ahmed_123456')).toBeNull();
    expect(validateUsername('ALI_000001')).toBeNull();
  });

  it('validateMajor rejects empty', () => {
    expect(validateMajor('')).toBeTruthy();
    expect(validateMajor('   ')).toBeTruthy();
  });

  it('validateMajor accepts non-empty', () => {
    expect(validateMajor('Computer Science')).toBeNull();
  });

  it('validatePhone rejects invalid numbers', () => {
    expect(validatePhone('', COUNTRY_SY)).toBeTruthy();
    expect(validatePhone('12345', COUNTRY_SY)).toBeTruthy();
    expect(validatePhone('12345678901234567890123', COUNTRY_SY)).toBeTruthy();
    expect(validatePhone('12345', null)).toBeTruthy();
  });

  it('validatePhone accepts valid numbers', () => {
    expect(validatePhone('+963933123456', COUNTRY_SY)).toBeNull();
    expect(validatePhone('0933123456', COUNTRY_SY)).toBeNull();
    expect(validatePhone('+966551234567', { code: 'SA', dial: '+966', minLen: 9, maxLen: 12 })).toBeNull();
  });

  it('validatePassword rejects weak', () => {
    expect(validatePassword('1234567', '1234567')).toBeTruthy();
    expect(validatePassword('', '')).toBeTruthy();
    expect(validatePassword('abc', 'def')).toBeTruthy();
  });

  it('validatePassword accepts matching passwords', () => {
    expect(validatePassword('password123', 'password123')).toBeNull();
    expect(validatePassword('a'.repeat(128), 'a'.repeat(128))).toBeNull();
  });

  it('formatFieldError falls back to key when i18n attribute missing', () => {
    expect(formatFieldError('username')).toBe('registerDuplicateUsername');
    expect(formatFieldError('email')).toBe('registerDuplicateEmail');
  });

  it('formatFieldError uses i18n attribute when set', () => {
    document.documentElement.setAttribute('data-i18n-registerDuplicateUsername', 'اسم المستخدم مسجّل مسبقاً');
    document.documentElement.setAttribute('data-i18n-registerDuplicateEmail', 'البريد الإلكتروني مسجّل مسبقاً');
    expect(formatFieldError('username')).toBe('اسم المستخدم مسجّل مسبقاً');
    expect(formatFieldError('email')).toBe('البريد الإلكتروني مسجّل مسبقاً');
  });

  it('calcStrength returns correct scores', () => {
    expect(calcStrength('')).toBe(0);
    expect(calcStrength('abcdefgh')).toBe(1);
    expect(calcStrength('Abcdefgh')).toBe(2);
    expect(calcStrength('Abcdefg1')).toBe(3);
    expect(calcStrength('Abcdefg1!')).toBe(4);
  });
});

