import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loginSchema, registerSchema, profileSchema, securitySchema, deleteAccountSchema } from '../../src/schemas/auth.schema';

describe('auth.schema validation', () => {
  describe('loginSchema', () => {
    it('accepts valid email and password', () => {
      const result = loginSchema.safeParse({ email: 'user@example.com', password: 'Password123!' });
      expect(result.success).toBe(true);
    });

    it('rejects invalid email format', () => {
      const result = loginSchema.safeParse({ email: 'not-an-email', password: 'Password123!' });
      expect(result.success).toBe(false);
    });

    it('rejects short password', () => {
      const result = loginSchema.safeParse({ email: 'user@example.com', password: 'Short1!' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      }
    });

    it('rejects missing email', () => {
      const result = loginSchema.safeParse({ email: '', password: 'Password123!' });
      expect(result.success).toBe(false);
    });

    it('rejects password longer than 128 chars', () => {
      const result = loginSchema.safeParse({
        email: 'user@example.com',
        password: 'A'.repeat(129),
      });
      expect(result.success).toBe(false);
    });
  });

  describe('registerSchema', () => {
    it('accepts valid registration input', () => {
      const result = registerSchema.safeParse({
        name: 'أحمد محمد',
        email: 'ahmed@example.com',
        password: 'Password123!',
      });
      expect(result.success).toBe(true);
    });

    it('rejects short name', () => {
      const result = registerSchema.safeParse({
        name: 'أ',
        email: 'ahmed@example.com',
        password: 'Password123!',
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid email', () => {
      const result = registerSchema.safeParse({
        name: 'أحمد',
        email: 'invalid-email',
        password: 'Password123!',
      });
      expect(result.success).toBe(false);
    });

    it('rejects short password', () => {
      const result = registerSchema.safeParse({
        name: 'أحمد',
        email: 'ahmed@example.com',
        password: 'Short1!',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('profileSchema', () => {
    it('accepts valid profile data', () => {
      const result = profileSchema.safeParse({
        full_name: 'أحمد محمد',
        username: 'ahmed_m',
        email: 'ahmed@example.com',
      });
      expect(result.success).toBe(true);
    });

    it('rejects username with Arabic letters', () => {
      const result = profileSchema.safeParse({
        full_name: 'أحمد',
        username: 'أحمد',
        email: 'ahmed@example.com',
      });
      expect(result.success).toBe(false);
    });

    it('rejects empty full_name', () => {
      const result = profileSchema.safeParse({
        full_name: '',
        username: 'ahmed',
        email: 'ahmed@example.com',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('securitySchema', () => {
    it('accepts matching passwords', () => {
      const result = securitySchema.safeParse({
        current_password: 'OldPass123!',
        new_password: 'NewPass123!',
        confirm_password: 'NewPass123!',
      });
      expect(result.success).toBe(true);
    });

    it('rejects mismatched confirm password', () => {
      const result = securitySchema.safeParse({
        current_password: 'OldPass123!',
        new_password: 'NewPass123!',
        confirm_password: 'Different123!',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('deleteAccountSchema', () => {
    it('accepts non-empty confirmation', () => {
      const result = deleteAccountSchema.safeParse({ confirmation: 'myusername' });
      expect(result.success).toBe(true);
    });

    it('rejects empty confirmation', () => {
      const result = deleteAccountSchema.safeParse({ confirmation: '' });
      expect(result.success).toBe(false);
    });
  });
});
