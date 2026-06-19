import { describe, it, expect } from 'vitest';
import { validateEmail, validatePassword, validateName } from '@/src/utils/validators';

describe('validators', () => {
  it('should validate email correctly', () => {
    expect(validateEmail('test@example.com').isValid).toBe(true);
    expect(validateEmail('invalid').isValid).toBe(false);
  });

  it('should validate required fields (password)', () => {
    expect(validatePassword('').isValid).toBe(false);
    expect(validatePassword('Password123!').isValid).toBe(true);
  });

  it('should validate name', () => {
    expect(validateName('').isValid).toBe(false);
    expect(validateName('John').isValid).toBe(true);
  });
});