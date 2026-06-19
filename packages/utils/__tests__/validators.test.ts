import { describe, it, expect } from 'vitest';
import { isValidEmail, isValidPhone, isValidPassword, getPasswordStrength } from '../src/validation/validators';

describe('validators', () => {
  describe('isValidEmail', () => {
    it('returns true for valid email', () => expect(isValidEmail('a@b.com')).toBe(true));
    it('returns false for invalid email', () => expect(isValidEmail('invalid')).toBe(false));
    it('returns false for empty string', () => expect(isValidEmail('')).toBe(false));
    it('returns false for @ only', () => expect(isValidEmail('@')).toBe(false));
  });

  describe('isValidPhone', () => {
    it('returns true for valid phone', () => expect(isValidPhone('+966500000000')).toBe(true));
    it('returns false for short phone', () => expect(isValidPhone('123')).toBe(false));
    it('returns false for empty string', () => expect(isValidPhone('')).toBe(false));
    it('returns true for 966500000000', () => expect(isValidPhone('966500000000')).toBe(true));
  });

  describe('isValidPassword', () => {
    it('returns true for password with uppercase, lowercase, number and special char', () => expect(isValidPassword('Abc123!@')).toBe(true));
    it('returns false for short password', () => expect(isValidPassword('123')).toBe(false));
    it('returns false for empty string', () => expect(isValidPassword('')).toBe(false));
    it('returns false for 7 chars', () => expect(isValidPassword('1234567')).toBe(false));
    it('returns false for missing uppercase', () => expect(isValidPassword('abc123!@')).toBe(false));
    it('returns false for missing lowercase', () => expect(isValidPassword('ABC123!@')).toBe(false));
    it('returns false for missing number', () => expect(isValidPassword('Abcdef!@')).toBe(false));
    it('returns false for missing special char', () => expect(isValidPassword('Abc12345')).toBe(false));
  });

  describe('getPasswordStrength', () => {
    it('returns 0 for empty', () => expect(getPasswordStrength('')).toBe(0));
    it('returns 4 for strong password', () => expect(getPasswordStrength('Abc123!@')).toBe(4));
    it('returns 1 for weak password', () => expect(getPasswordStrength('a')).toBe(1));
    it('returns 2 for medium-weak password', () => expect(getPasswordStrength('ab')).toBe(2));
    it('returns 3 for medium password', () => expect(getPasswordStrength('abc')).toBe(3));
    it('returns 5 for very strong password', () => expect(getPasswordStrength('Abc123!@#')).toBe(5));
  });
});
