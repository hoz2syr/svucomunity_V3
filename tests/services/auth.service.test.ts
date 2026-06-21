import { describe, expect, it, vi, beforeEach } from 'vitest';

const client = vi.hoisted(() => ({
  auth: {
    setSession: vi.fn(),
    getUser: vi.fn(),
    signOut: vi.fn(),
  },
  functions: {
    invoke: vi.fn(),
  },
}));

const lib = vi.hoisted(() => {
  const MISSING_ENV_MSG = 'Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local';
  return {
    getErrorMessage: (error: unknown) => error instanceof Error ? error.message : String(error),
    getSupabaseClient: vi.fn(() => client),
    hasSupabaseEnv: vi.fn(() => true),
    missingSupabaseEnvMessage: MISSING_ENV_MSG,
    handleAuthCallback: vi.fn(),
  };
});

vi.mock('@/src/lib/supabase', () => lib);

describe('auth service', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    lib.hasSupabaseEnv.mockReturnValue(true);
    client.auth.setSession.mockResolvedValue({ error: null });
    client.functions.invoke.mockResolvedValue({ data: null, error: null });
  });

  it('loginWithPassword calls auth-login edge function and sets session', async () => {
    const mockSession = {
      access_token: 'access-token',
      refresh_token: 'refresh-token',
      user: { id: 'user-1', email: 'a@example.com' },
    };
    client.functions.invoke.mockResolvedValueOnce({
      data: { session: mockSession },
      error: null,
    });

    const { loginWithPassword } = await import('@/src/services/auth.service');
    const result = await loginWithPassword('a@example.com', 'Password123!');

    expect(client.functions.invoke).toHaveBeenCalledWith('auth-login', {
      body: { email: 'a@example.com', password: 'Password123!' },
    });
    expect(client.auth.setSession).toHaveBeenCalledWith({
      access_token: 'access-token',
      refresh_token: 'refresh-token',
    });
    expect(result.error).toBeNull();
    expect(result.data).toEqual({ user: mockSession.user });
  });

  it('loginWithPassword returns error from edge function', async () => {
    client.functions.invoke.mockResolvedValueOnce({
      data: { error: 'Invalid credentials' },
      error: null,
    });

    const { loginWithPassword } = await import('@/src/services/auth.service');
    const result = await loginWithPassword('a@example.com', 'WrongPass1!');

    expect(result.error).not.toBeNull();
    expect(result.error?.message).toBe('Invalid credentials');
  });

  it('loginWithPassword returns error when edge function returns error object', async () => {
    client.functions.invoke.mockResolvedValueOnce({
      data: null,
      error: { message: 'Network error' },
    });

    const { loginWithPassword } = await import('@/src/services/auth.service');
    const result = await loginWithPassword('a@example.com', 'Password123!');

    expect(result.error).not.toBeNull();
    expect(result.error?.message).toBe('Network error');
  });

  it('loginWithPassword returns missing-env error when environment not configured', async () => {
    lib.hasSupabaseEnv.mockReturnValue(false);
    const { loginWithPassword } = await import('@/src/services/auth.service');

    const result = await loginWithPassword('a@example.com', 'Password123!');
    expect(result.data).toBeNull();
    expect(result.error?.message).toContain('Missing Supabase environment');
    expect(client.functions.invoke).not.toHaveBeenCalled();
  });

  it('registerWithEmail calls auth-register edge function', async () => {
    client.functions.invoke.mockResolvedValueOnce({
      data: {
        data: {
          user: { id: 'user-2', email: 'new@example.com' },
        },
        session: {
          access_token: 'reg-access',
          refresh_token: 'reg-refresh',
        },
      },
      error: null,
    });

    const { registerWithEmail } = await import('@/src/services/auth.service');
    const result = await registerWithEmail('طالب جديد', 'new@example.com', 'Password123!');

    expect(client.functions.invoke).toHaveBeenCalledWith('auth-register', {
      body: { name: 'طالب جديد', email: 'new@example.com', password: 'Password123!' },
    });
    expect(client.auth.setSession).toHaveBeenCalledWith({
      access_token: 'reg-access',
      refresh_token: 'reg-refresh',
    });
    expect(result.error).toBeNull();
  });

  it('registerWithEmail returns error from edge function', async () => {
    client.functions.invoke.mockResolvedValueOnce({
      data: { error: 'Email already exists' },
      error: null,
    });

    const { registerWithEmail } = await import('@/src/services/auth.service');
    const result = await registerWithEmail('طالب', 'exists@example.com', 'Password123!');

    expect(result.error).not.toBeNull();
    expect(result.error?.message).toBe('Email already exists');
  });

  it('registerWithEmail returns missing-env error when environment not configured', async () => {
    lib.hasSupabaseEnv.mockReturnValue(false);
    const { registerWithEmail } = await import('@/src/services/auth.service');

    const result = await registerWithEmail('طالب', 'a@example.com', 'Password123!');
    expect(result.data).toBeNull();
    expect(result.error?.message).toContain('Missing Supabase environment');
    expect(client.functions.invoke).not.toHaveBeenCalled();
  });

  it('completeAuthCallback passes through libHandleAuthCallback result', async () => {
    const libModule = await import('@/src/lib/supabase');
    const { completeAuthCallback } = await import('@/src/services/auth.service');

    const successData = { session: { user: { id: 'user-1', email: 'u@example.com' } } };
    libModule.hasSupabaseEnv.mockReturnValue(true);
    libModule.handleAuthCallback.mockResolvedValue({ data: successData, error: null });

    const result = await completeAuthCallback();

    expect(result.data).toEqual(successData);
    expect(result.error).toBeNull();
  });

  it('completeAuthCallback returns error from libHandleAuthCallback', async () => {
    const libModule = await import('@/src/lib/supabase');
    const { completeAuthCallback } = await import('@/src/services/auth.service');

    const rlsError = { message: 'new row violates row-level security policy' };
    libModule.hasSupabaseEnv.mockReturnValue(true);
    libModule.handleAuthCallback.mockResolvedValue({ data: { session: null }, error: rlsError });

    const result = await completeAuthCallback();

    expect(result.data).toEqual({ session: null });
    expect(result.error?.message).toBe(rlsError.message);
  });

  it('loginWithPassword handles thrown error gracefully', async () => {
    client.functions.invoke.mockRejectedValueOnce(new Error('Unexpected failure'));
    const { loginWithPassword } = await import('@/src/services/auth.service');

    const result = await loginWithPassword('a@example.com', 'Password123!');
    expect(result.error).not.toBeNull();
    expect(result.data).toBeNull();
  });
});
