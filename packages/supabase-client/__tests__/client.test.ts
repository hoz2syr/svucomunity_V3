import { describe, it, expect, vi } from 'vitest';
vi.mock('@supabase/supabase-js', () => ({ createClient: vi.fn(() => ({})), }));
import { isAdmin } from '../src/index';

describe('supabase client', () => {
  it('isAdmin returns false for null user', () => {
    expect(isAdmin(null)).toBe(false);
  });

  it('isAdmin returns user.is_admin for non-null user', () => {
    expect(isAdmin({ is_admin: true } as { is_admin: boolean })).toBe(true);
    expect(isAdmin({ is_admin: false } as { is_admin: boolean })).toBe(false);
  });

  it('isAdmin returns false for undefined user', () => {
    expect(isAdmin(undefined as any)).toBe(false);
  });
});
