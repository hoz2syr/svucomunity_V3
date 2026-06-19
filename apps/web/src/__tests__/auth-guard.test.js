import { describe, expect, it, vi } from 'vitest';

vi.mock('../js/modules/core.js', () => {
  const isLoggedIn = vi.fn();
  const getCurrentUser = vi.fn();
  const clearUserSession = vi.fn();
  return { isLoggedIn, getCurrentUser, clearUserSession };
});

vi.mock('../js/modules/config.js', () => {
  const getDb = vi.fn();
  const initSupabase = vi.fn();
  const verifySessionWithServer = vi.fn();
  const getConfigError = vi.fn(() => ({ message: 'test-config-error' }));
  return { getDb, initSupabase, verifySessionWithServer, getConfigError };
});

vi.mock('../js/modules/shared.js', () => ({
  showToast: vi.fn(),
  openModal: vi.fn(),
  closeModal: vi.fn(),
}));

import { checkAuth } from '../js/modules/auth/auth-guard.js';

describe('auth-guard', () => {
  it('redirects to login when no db', async () => {
    const { getDb, initSupabase, getConfigError } = await import('../js/modules/config.js');
    getDb.mockReturnValue(null);
    initSupabase.mockReturnValue(null);
    const set = vi.spyOn(window.location, 'href', 'set').mockImplementation(() => {});
    expect(await checkAuth()).toBeNull();
    expect(set).toHaveBeenCalledWith(`${window.location.origin}/login.html`);
  });

  it('redirects to login on invalid session', async () => {
    const { getDb, verifySessionWithServer } = await import('../js/modules/config.js');
    getDb.mockReturnValue({ from: vi.fn() });
    verifySessionWithServer.mockResolvedValue(false);
    const set = vi.spyOn(window.location, 'href', 'set').mockImplementation(() => {});
    expect(await checkAuth()).toBeNull();
    expect(set).toHaveBeenCalledWith(`${window.location.origin}/login.html`);
  });

  it('returns user and db on silent auth', async () => {
    const { getDb, verifySessionWithServer } = await import('../js/modules/config.js');
    const { isLoggedIn, getCurrentUser } = await import('../js/modules/core.js');
    const db = { from: vi.fn().mockReturnThis(), select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), single: vi.fn() };
    getDb.mockReturnValue(db);
    verifySessionWithServer.mockResolvedValue(true);
    isLoggedIn.mockReturnValue(true);
    getCurrentUser.mockReturnValue({ id: 'u1' });
    expect(await checkAuth({ silent: true })).toEqual({ user: { id: 'u1' }, db });
  });

  it('blocks non-admin; redirects to index', async () => {
    const { getDb, verifySessionWithServer } = await import('../js/modules/config.js');
    const { isLoggedIn, getCurrentUser } = await import('../js/modules/core.js');
    const db = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { is_admin: false, is_active: true } }),
    };
    getDb.mockReturnValue(db);
    verifySessionWithServer.mockResolvedValue(true);
    isLoggedIn.mockReturnValue(true);
    getCurrentUser.mockReturnValue({ id: 'u2' });
    const set = vi.spyOn(window.location, 'href', 'set').mockImplementation(() => {});
    expect(await checkAuth({ requireAdmin: true })).toBeNull();
    expect(set).toHaveBeenCalledWith(`${window.location.origin}/index.html`);
  });

  it('redirects to index when admin check throws', async () => {
    const { getDb, verifySessionWithServer } = await import('../js/modules/config.js');
    const { isLoggedIn, getCurrentUser } = await import('../js/modules/core.js');
    const db = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockRejectedValue(new Error('PGRST116')),
    };
    getDb.mockReturnValue(db);
    verifySessionWithServer.mockResolvedValue(true);
    isLoggedIn.mockReturnValue(true);
    getCurrentUser.mockReturnValue({ id: 'u3' });
    const set = vi.spyOn(window.location, 'href', 'set').mockImplementation(() => {});
    expect(await checkAuth({ requireAdmin: true })).toBeNull();
    expect(set).toHaveBeenCalledWith(`${window.location.origin}/index.html`);
  });
});
