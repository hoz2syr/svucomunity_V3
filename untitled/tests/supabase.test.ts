import { describe, expect, it, vi, beforeEach } from 'vitest';

const missingSupabaseEnvMessage = 'Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local';

describe('supabase client', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it('does not throw when imported without Supabase environment variables', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');

    await expect(import('@/src/lib/supabase')).resolves.toBeDefined();
  });

  it('reports missing Supabase environment when a client is requested', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');

    const { getSupabaseClient, hasSupabaseEnv } = await import('@/src/lib/supabase');

    expect(hasSupabaseEnv()).toBe(false);
    expect(() => getSupabaseClient()).toThrow(missingSupabaseEnvMessage);
  });

  it('returns missing-env errors from public auth helpers', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');

    const { signInWithGoogle, handleAuthCallback, deleteOwnAccount } = await import('@/src/lib/supabase');

    await expect(signInWithGoogle()).resolves.toEqual({ data: null, error: { message: missingSupabaseEnvMessage } });
    await expect(handleAuthCallback()).resolves.toEqual({ data: { session: null }, error: { message: missingSupabaseEnvMessage } });
    await expect(deleteOwnAccount()).resolves.toEqual({ ok: false, error: missingSupabaseEnvMessage });
  });

  it('does not run operations when environment service reports missing env', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');

    const { hasSupabaseEnv } = await import('@/src/services/environment.service');
    const { loginWithPassword, registerWithEmail, fetchNotifications } = await import('@/src/services');

    expect(hasSupabaseEnv()).toBe(false);
    await expect(loginWithPassword('a@b.com', 'Password123!')).resolves.toEqual({ data: null, error: { message: missingSupabaseEnvMessage } });
    await expect(registerWithEmail('Student', 'a@b.com', 'Password123!')).resolves.toEqual({ data: null, error: { message: missingSupabaseEnvMessage } });
    await expect(fetchNotifications()).resolves.toEqual({ data: [], error: { message: missingSupabaseEnvMessage } });
  });
});