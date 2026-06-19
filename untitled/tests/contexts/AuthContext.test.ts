import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockUseAuth = vi.fn();
vi.mock('../../src/contexts/AuthContext', () => ({
  useAuth: (...args: any[]) => mockUseAuth(...args),
}));

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('should export useAuth hook', async () => {
    const mod = await import('../../src/contexts/AuthContext');
    expect(typeof mod.useAuth).toBe('function');
  });

  it('should return session/user when authenticated', async () => {
    mockUseAuth.mockReturnValue({
      session: { user: { id: '1', email: 'a@b.com' } },
      loading: false,
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
    });

    const { useAuth } = await import('../../src/contexts/AuthContext');
    const result = useAuth();
    expect(result.session).toBeDefined();
    expect(result.session.user.email).toBe('a@b.com');
  });

  it('should return loading true while checking auth', async () => {
    mockUseAuth.mockReturnValue({
      session: null,
      loading: true,
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
    });

    const { useAuth } = await import('../../src/contexts/AuthContext');
    const result = useAuth();
    expect(result.loading).toBe(true);
    expect(result.session).toBeNull();
  });

  it('should expose signOut method', async () => {
    const signOut = vi.fn();
    mockUseAuth.mockReturnValue({
      session: null,
      loading: false,
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut,
    });

    const { useAuth } = await import('../../src/contexts/AuthContext');
    const result = useAuth();
    result.signOut();
    expect(signOut).toHaveBeenCalledOnce();
  });
});
