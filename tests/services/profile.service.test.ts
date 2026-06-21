import { describe, expect, it, vi, beforeEach } from 'vitest';

const MESSAGE = 'Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local';

const mockGetSupabaseClient = vi.hoisted(() => vi.fn());

const mockEqUpdate = vi.hoisted(() => vi.fn(() => ({ error: null })));
const mockEqPassword = vi.hoisted(() => vi.fn(() => ({ error: null })));

vi.mock('@/src/lib/supabase', () => {
  const authMethods: Record<string, unknown> = {
    signInWithPassword: vi.fn(() => ({ error: null })),
    updateUser: vi.fn(() => ({ error: null })),
  };

  return {
    getSupabaseClient: mockGetSupabaseClient,
    hasSupabaseEnv: vi.fn(() => true),
    missingSupabaseEnvMessage: MESSAGE,
    getErrorMessage: (error: unknown) => error instanceof Error ? error.message : String(error),
  };
});

describe('profile service', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mockEqUpdate.mockClear();
    mockEqPassword.mockClear();
  });

  it('updates profile fields', async () => {
    mockGetSupabaseClient.mockReturnValue({
      from: vi.fn(() => ({
        update: vi.fn(() => ({
          eq: mockEqUpdate,
        })),
      })),
      auth: {
        getUser: vi.fn(() => ({ data: { user: { id: '1' } } })),
      },
    } as never);

    const { updateProfile } = await import('@/src/services/profile.service');
    const result = await updateProfile('1', 'طالب جديد', 'student2');

    expect(mockEqUpdate).toHaveBeenCalledWith('id', '1');
    expect(result.error).toBeNull();
  });

  it('updates password after current-password verification', async () => {
    mockGetSupabaseClient.mockReturnValue({
      from: vi.fn(() => ({})),
      auth: {
        getUser: vi.fn(() => ({ data: { user: { id: '1', email: 'a@example.com' } } })),
        signInWithPassword: vi.fn(() => ({ error: null })),
        updateUser: vi.fn(() => ({ error: null })),
      },
    } as never);

    const { updatePassword } = await import('@/src/services/profile.service');
    const result = await updatePassword('a@example.com', 'OldPass123!', 'NewPass123!');

    expect(result.error).toBeNull();
  });

  it('returns missing-env error without calling Supabase', async () => {
    const { hasSupabaseEnv } = await import('@/src/lib/supabase');
    vi.mocked(hasSupabaseEnv).mockReturnValue(false);

    const { refreshProfile } = await import('@/src/services/profile.service');
    const result = await refreshProfile('1');

    expect(result.data).toBeNull();
    expect(result.error?.message).toContain('Missing Supabase environment');
  });
});
