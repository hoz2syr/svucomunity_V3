import { describe, expect, it, vi, beforeEach } from 'vitest';

const missingSupabaseEnvMessage = 'Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local';

const client = vi.hoisted(() => ({
  auth: {
    getUser: vi.fn(),
    signOut: vi.fn(),
  },
  functions: {
    invoke: vi.fn(),
  },
}));

const lib = vi.hoisted(() => ({
  getErrorMessage: (error: unknown, fallback = 'حدث خطأ غير متوقع.') => error instanceof Error ? error.message : typeof error === 'string' ? error : fallback,
  getSupabaseClient: vi.fn(() => client),
  hasSupabaseEnv: vi.fn(() => true),
  missingSupabaseEnvMessage: 'Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local',
}));

vi.mock('../../src/lib/supabase', () => lib);

describe('account service', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    lib.hasSupabaseEnv.mockReturnValue(true);
    client.auth.getUser.mockResolvedValue({ data: { user: { id: '1', email: 'a@example.com' } }, error: null });
    client.functions.invoke.mockResolvedValue({ error: null });
    client.auth.signOut.mockResolvedValue(undefined);
  });

  it('deletes the current account through the Edge Function', async () => {
    const { deleteOwnAccount } = await import('../../src/services/account.service');

    await expect(deleteOwnAccount()).resolves.toEqual({ ok: true });
    expect(client.auth.getUser).toHaveBeenCalled();
    expect(client.functions.invoke).toHaveBeenCalledWith('delete-account');
  });

  it('signs out the current user', async () => {
    const { signOutCurrentUser } = await import('../../src/services/account.service');

    await expect(signOutCurrentUser()).resolves.toEqual({ ok: true });
    expect(client.auth.signOut).toHaveBeenCalled();
  });

  it('returns a typed missing-env error without calling Supabase', async () => {
    lib.hasSupabaseEnv.mockReturnValue(false);
    const { signOutCurrentUser } = await import('../../src/services/account.service');

    await expect(signOutCurrentUser()).resolves.toEqual({ ok: false, error: missingSupabaseEnvMessage });
    expect(client.auth.signOut).not.toHaveBeenCalled();
  });
});
