import { describe, expect, it, vi, beforeEach } from 'vitest';

const MESSAGE = 'Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local';

vi.mock('@/src/lib/supabase', () => ({
  getSupabaseClient: vi.fn(),
  hasSupabaseEnv: vi.fn(() => true),
  missingSupabaseEnvMessage: MESSAGE,
  getErrorMessage: (error: unknown) => error instanceof Error ? error.message : String(error),
}));
vi.mock('@/src/services/profile.service', () => ({ upsertProfile: vi.fn() }));

describe('auth service', () => {
  const mockSupabase = {
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue({ data: { user: { id: '1', email: 'a@example.com' } }, error: null }),
      signUp: vi.fn().mockResolvedValue({ data: { user: { id: '1', email: 'a@example.com' } }, error: null }),
      signInWithOAuth: vi.fn().mockResolvedValue({ data: { url: 'https://example.com' }, error: null }),
      resetPasswordForEmail: vi.fn().mockResolvedValue({ data: null, error: null }),
    },
  };

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.mocked(vi.fn()).mockReturnValue(true);
  });

  it('signs in with password through Supabase', async () => {
    const lib = await import('@/src/lib/supabase');
    vi.mocked(lib.hasSupabaseEnv).mockReturnValue(true);
    vi.mocked(lib.getSupabaseClient).mockReturnValue(mockSupabase as any);

    const { loginWithPassword } = await import('@/src/services/auth.service');
    const result = await loginWithPassword('a@example.com', 'Password123!');

    expect(result.error).toBeNull();
  });

  it('registers with email and name through Supabase', async () => {
    const lib = await import('@/src/lib/supabase');
    vi.mocked(lib.hasSupabaseEnv).mockReturnValue(true);
    vi.mocked(lib.getSupabaseClient).mockReturnValue(mockSupabase as any);

    const { registerWithEmail } = await import('@/src/services/auth.service');
    const result = await registerWithEmail('طالب', 'a@example.com', 'Password123!');

    expect(result.error).toBeNull();
  });

  it('returns missing-env error when environment not configured', async () => {
    const lib = await import('@/src/lib/supabase');
    vi.mocked(lib.hasSupabaseEnv).mockReturnValue(false);
    const { loginWithPassword } = await import('@/src/services/auth.service');

    const result = await loginWithPassword('a@example.com', 'Password123!');
    expect(result.data).toBeNull();
    expect(result.error?.message).toContain('Missing Supabase environment');
  });
});