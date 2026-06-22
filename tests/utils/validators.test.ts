/**
 * @file validators.test.ts
 *
 * @deprecated `src/utils/validators.ts` is deprecated — all validation rules now live
 * exclusively in Zod schemas under `src/schemas/auth.schema.ts` and are consumed
 * via `zodResolver` in React Hook Form. This file redirects coverage to the
 * authoritative schemas so no validation rule is left untested.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ Migration table                                                    │
 * ├──────────────────────────────────┬──────────────────────────────────┤
 * │ Before (validators.ts)           │ After (auth.schema.ts)           │
 * ├──────────────────────────────────┼──────────────────────────────────┤
 * │ validateEmail(email)             │ loginSchema.safeParse({ email }) │
 * │ validatePassword(password)       │ loginSchema.safeParse({ password })│
 * │ validateName(name)               │ registerSchema.safeParse({ name })│
 * └──────────────────────────────────┴──────────────────────────────────┘
 */

import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema, resetPasswordSchema } from '@/src/schemas/auth.schema';

describe('validation rules (authoritative source: auth.schema.ts)', () => {
  describe('loginSchema', () => {
    it('accepts valid email and password', () => {
      expect(loginSchema.safeParse({ email: 'user@example.com', password: 'Password123!' }).success).toBe(true);
    });

    it('rejects empty email', () => {
      const result = loginSchema.safeParse({ email: '', password: 'Password123!' });
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error.errors[0].message).toBe('البريد الإلكتروني مطلوب');
    });

    it('rejects malformed email', () => {
      const result = loginSchema.safeParse({ email: 'not-an-email', password: 'Password123!' });
      expect(result.success).toBe(false);
    });

    it('rejects short password (under 8 chars)', () => {
      const result = loginSchema.safeParse({ email: 'user@example.com', password: 'Short1!' });
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error.errors[0].message).toBe('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
    });

    it('rejects password over 128 chars', () => {
      const result = loginSchema.safeParse({ email: 'user@example.com', password: 'A'.repeat(129) });
      expect(result.success).toBe(false);
    });
  });

  describe('registerSchema', () => {
    it('accepts valid name, email and password', () => {
      expect(registerSchema.safeParse({ name: 'أحمد محمد', email: 'ahmed@example.com', password: 'Password123!' }).success).toBe(true);
    });

    it('rejects empty name', () => {
      const result = registerSchema.safeParse({ name: '', email: 'ahmed@example.com', password: 'Password123!' });
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error.errors.some(e => e.message === 'الاسم مطلوب')).toBe(true);
    });

    it('rejects name shorter than 2 chars', () => {
      const result = registerSchema.safeParse({ name: 'أ', email: 'ahmed@example.com', password: 'Password123!' });
      expect(result.success).toBe(false);
    });

    it('rejects name over 100 chars', () => {
      const result = registerSchema.safeParse({ name: 'أ'.repeat(101), email: 'ahmed@example.com', password: 'Password123!' });
      expect(result.success).toBe(false);
    });

    it('rejects invalid email', () => {
      const result = registerSchema.safeParse({ name: 'أحمد', email: 'invalid-email', password: 'Password123!' });
      expect(result.success).toBe(false);
    });

    it('rejects short password', () => {
      const result = registerSchema.safeParse({ name: 'أحمد', email: 'ahmed@example.com', password: 'Short1!' });
      expect(result.success).toBe(false);
    });
  });

  describe('resetPasswordSchema', () => {
    it('accepts a valid email', () => {
      expect(resetPasswordSchema.safeParse({ email: 'user@example.com' }).success).toBe(true);
    });

    it('rejects empty email', () => {
      const result = resetPasswordSchema.safeParse({ email: '' });
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error.errors[0].message).toBe('البريد الإلكتروني مطلوب');
    });

    it('rejects malformed email', () => {
      const result = resetPasswordSchema.safeParse({ email: 'not-an-email' });
      expect(result.success).toBe(false);
    });

    it('rejects email over 255 chars', () => {
      const result = resetPasswordSchema.safeParse({ email: 'a'.repeat(250) + '@x.com' });
      expect(result.success).toBe(false);
    });
  });
});
