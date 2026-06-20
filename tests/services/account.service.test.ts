import { describe, expect, it, vi, beforeEach } from 'vitest';

const EDGE_FUNCTION_TIMEOUT_MS = 15_000;

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

describe('delete-account: Edge Function integration', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    lib.hasSupabaseEnv.mockReturnValue(true);
    client.auth.getUser.mockResolvedValue({ data: { user: { id: '1', email: 'a@example.com', user_metadata: {}, app_metadata: {} } }, error: null });
    client.functions.invoke.mockResolvedValue({ error: null });
    client.auth.signOut.mockResolvedValue(undefined);
  });

  it('deletes the current account through the Edge Function', async () => {
    const { deleteOwnAccount } = await import('../../src/services/account.service');

    await expect(deleteOwnAccount()).resolves.toEqual({ ok: true });
    expect(client.auth.getUser).toHaveBeenCalled();
    expect(client.functions.invoke).toHaveBeenCalledWith('delete-account');
  });

  it('returns a typed missing-env error without calling Supabase', async () => {
    lib.hasSupabaseEnv.mockReturnValue(false);
    const { deleteOwnAccount } = await import('../../src/services/account.service');

    await expect(deleteOwnAccount()).resolves.toEqual({ ok: false, error: missingSupabaseEnvMessage });
    expect(client.functions.invoke).not.toHaveBeenCalled();
  });

  it('propagates an invalid-session error before calling the Edge Function', async () => {
    client.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null });
    const { deleteOwnAccount } = await import('../../src/services/account.service');

    const result = await deleteOwnAccount();
    expect(result.ok).toBe(false);
    expect(result.error).toContain('تعذر التحقق من الجلسة');
    expect(client.functions.invoke).not.toHaveBeenCalled();
  });

  it('translates a network-like Edge Function error into a friendly Arabic message', async () => {
    client.functions.invoke.mockResolvedValueOnce({
      error: { message: 'NetworkError when attempting to fetch resource.', status: undefined },
    });
    const { deleteOwnAccount } = await import('../../src/services/account.service');

    const result = await deleteOwnAccount();
    expect(result.ok).toBe(false);
    expect(result.error).toContain('اتصال');
  });

  it('translates an Edge Function error mentioning the function name', async () => {
    client.functions.invoke.mockResolvedValueOnce({
      error: { message: 'Failed to send a request to the Edge Function.', status: 502 },
    });
    const { deleteOwnAccount } = await import('../../src/services/account.service');

    const result = await deleteOwnAccount();
    expect(result.ok).toBe(false);
    expect(result.error).toContain('خدمة حذف الحساب');
  });

  it('translates a 429 rate-limit response into a retry message', async () => {
    client.functions.invoke.mockResolvedValueOnce({
      error: { message: 'Too many requests', status: 429 },
    });
    const { deleteOwnAccount } = await import('../../src/services/account.service');

    const result = await deleteOwnAccount();
    expect(result.ok).toBe(false);
    expect(result.error).toContain('الانتظار');
  });

  it('translates a 403 admin-forbidden response', async () => {
    client.functions.invoke.mockResolvedValueOnce({ error: { message: 'Forbidden', status: 403 } });
    const { deleteOwnAccount } = await import('../../src/services/account.service');

    const result = await deleteOwnAccount();
    expect(result.ok).toBe(false);
    expect(result.error).toContain('الأدمن');
  });

  it('translates a 401 unauthorized/expired session', async () => {
    client.functions.invoke.mockResolvedValueOnce({ error: { message: 'JWT expired', status: 401 } });
    const { deleteOwnAccount } = await import('../../src/services/account.service');

    const result = await deleteOwnAccount();
    expect(result.ok).toBe(false);
    expect(result.error).toContain('تسجيل الدخول');
  });

  it('translates a 5xx server error returned via the response object', async () => {
    client.functions.invoke.mockResolvedValueOnce({
      error: { message: 'Internal Server Error', status: 500 },
    });
    const { deleteOwnAccount } = await import('../../src/services/account.service');

    const result = await deleteOwnAccount();
    expect(result.ok).toBe(false);
    expect(result.error).toContain('الخادم');
  });

  it('propagates a thrown server error via the catch handler with a safe fallback', async () => {
    client.functions.invoke.mockRejectedValueOnce(new Error('Upstream connection reset'));
    const { deleteOwnAccount } = await import('../../src/services/account.service');

    const result = await deleteOwnAccount();
    expect(result.ok).toBe(false);
    expect(typeof result.error).toBe('string');
    expect(result.error.length).toBeGreaterThan(0);
  });

  it('converts an unknown thrown error into a safe Arabic fallback string', async () => {
    client.functions.invoke.mockRejectedValueOnce('unknown-string-error');
    const { deleteOwnAccount } = await import('../../src/services/account.service');

    const result = await deleteOwnAccount();
    expect(result.ok).toBe(false);
    expect(typeof result.error).toBe('string');
    expect(result.error.length).toBeGreaterThan(0);
  });
});

describe('account service: shared helpers', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.useRealTimers();
    lib.hasSupabaseEnv.mockReturnValue(true);
    client.auth.getUser.mockResolvedValue({ data: { user: { id: '1', email: 'a@example.com' } }, error: null });
    client.functions.invoke.mockResolvedValue({ error: null });
    client.auth.signOut.mockResolvedValue(undefined);
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
