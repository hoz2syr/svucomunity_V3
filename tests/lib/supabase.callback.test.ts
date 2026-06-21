import { describe, expect, it, vi, beforeEach } from 'vitest';

const missingSupabaseEnvMessage = 'Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local';

describe('handleAuthCallback coverage', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it('returns missing-env error when no Supabase env', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');

    const { handleAuthCallback } = await import('@/src/lib/supabase');
    const result = await handleAuthCallback();

    expect(result.data).toEqual({ session: null });
    expect(result.error?.message).toBe(missingSupabaseEnvMessage);
  });

  it('returns session user without upsert when email is not confirmed', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://example.com');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'anon');

    const profileQueryBuilder = {
      upsert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn(),
    };
    const fromSpy = vi.fn().mockReturnValue(profileQueryBuilder);

    vi.doMock('@supabase/supabase-js', () => ({
      createClient: vi.fn(() => ({
        auth: {
          getSession: vi.fn().mockResolvedValue({
            data: {
              session: {
                user: {
                  id: 'user-1',
                  email: 'a@example.com',
                  email_confirmed_at: null,
                  user_metadata: { full_name: 'Student', username: 'student' },
                  app_metadata: { provider: 'email', provider_id: null },
                },
              },
            },
            error: null,
          }),
        },
        from: fromSpy,
      })),
    }));

    const { handleAuthCallback } = await import('@/src/lib/supabase');
    const result = await handleAuthCallback();

    expect(result.data?.session?.user?.id).toBe('user-1');
    expect(result.error).toBeNull();
    expect(fromSpy).not.toHaveBeenCalled();
  });

  it('returns session user without upsert when email is confirmed', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://example.com');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'anon');

    const profileQueryBuilder = {
      upsert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn(),
    };
    const fromSpy = vi.fn().mockReturnValue(profileQueryBuilder);

    vi.doMock('@supabase/supabase-js', () => ({
      createClient: vi.fn(() => ({
        auth: {
          getSession: vi.fn().mockResolvedValue({
            data: {
              session: {
                user: {
                  id: 'user-1',
                  email: 'a@example.com',
                  email_confirmed_at: new Date().toISOString(),
                  user_metadata: { full_name: 'Student', username: 'student' },
                  app_metadata: { provider: 'google', provider_id: 'google-1' },
                },
              },
            },
            error: null,
          }),
        },
        from: fromSpy,
      })),
    }));

    const { handleAuthCallback } = await import('@/src/lib/supabase');
    const result = await handleAuthCallback();

    expect(result.data?.session?.user?.id).toBe('user-1');
    expect(result.error).toBeNull();
    expect(fromSpy).not.toHaveBeenCalled();
  });
});
