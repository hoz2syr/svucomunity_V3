import { describe, expect, it, vi, beforeEach } from 'vitest';
import { verifyCaller } from '../gemini-proxy/index.ts';
import { createMockSupabase } from './mocks/supabase.ts';

describe('gemini-proxy/verifyCaller', () => {
  let supabase;

  beforeEach(() => {
    vi.clearAllMocks();
    supabase = createMockSupabase();
  });

  it('returns 401 when auth header is missing', async () => {
    const result = await verifyCaller(supabase, '');
    expect(result.ok).toBe(false);
    expect(result.status).toBe(401);
    expect(result.error).toBe('authorization_required');
  });

  it('returns 401 when token is invalid', async () => {
    supabase.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'invalid token' },
    });
    const result = await verifyCaller(supabase, 'Bearer invalid-token');
    expect(result.ok).toBe(false);
    expect(result.status).toBe(401);
    expect(result.error).toBe('invalid_token');
  });

  it('returns 401 when profile not found', async () => {
    supabase.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: 'user-1' } },
      error: null,
    });
    supabase.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    const result = await verifyCaller(supabase, 'Bearer valid-token');
    expect(result.ok).toBe(false);
    expect(result.status).toBe(401);
    expect(result.error).toBe('profile_not_found');
  });

  it('returns profile for valid active user', async () => {
    supabase.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: 'user-1' } },
      error: null,
    });
    const mockProfile = { is_active: true };
    supabase.maybeSingle.mockResolvedValueOnce({ data: mockProfile, error: null });
    const result = await verifyCaller(supabase, 'Bearer valid-token');
    expect(result.ok).toBe(true);
    expect(result.data).toEqual(mockProfile);
  });
});
