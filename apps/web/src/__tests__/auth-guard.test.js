import { describe, expect, it, vi } from 'vitest';

const M = { isLoggedIn: vi.fn(), getCurrentUser: vi.fn(), clearUserSession: vi.fn() };
const C = { getDb: vi.fn(), initSupabase: vi.fn(), verifySessionWithServer: vi.fn() };
vi.mock('../../js/modules/core.js', () => M);
vi.mock('../../js/modules/config.js', () => C);
import { checkAuth } from '../../js/modules/auth/auth-guard.js';

describe('auth-guard', () => {
  it('redirects to login when no db', async () => {
    C.getDb.mockReturnValue(null); C.initSupabase.mockReturnValue(null);
    const set = vi.spyOn(window.location, 'href', 'set').mockImplementation(() => {});
    expect(await checkAuth()).toBeNull(); expect(set).toHaveBeenCalledWith('login.html');
  });

  it('redirects to login on invalid session', async () => {
    C.getDb.mockReturnValue({ from: vi.fn() });
    C.verifySessionWithServer.mockResolvedValue(false);
    const set = vi.spyOn(window.location, 'href', 'set').mockImplementation(() => {});
    expect(await checkAuth()).toBeNull(); expect(set).toHaveBeenCalledWith('login.html');
    expect(M.clearUserSession).not.toHaveBeenCalled();
  });

  it('returns user and db on silent auth', async () => {
    const db = { from: vi.fn().mockReturnThis(), select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), single: vi.fn() };
    C.getDb.mockReturnValue(db); C.verifySessionWithServer.mockResolvedValue(true);
    M.isLoggedIn.mockReturnValue(true); M.getCurrentUser.mockReturnValue({ id: 'u1' });
    expect(await checkAuth({ silent: true })).toEqual({ user: { id: 'u1' }, db });
  });

  it('blocks non-admin; redirects to index', async () => {
    const db = { from: vi.fn().mockReturnThis(), select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), single: vi.fn().mockResolvedValue({ data: { is_admin: false, is_active: true } }) };
    C.getDb.mockReturnValue(db); C.verifySessionWithServer.mockResolvedValue(true);
    M.isLoggedIn.mockReturnValue(true); M.getCurrentUser.mockReturnValue({ id: 'u2' });
    const set = vi.spyOn(window.location, 'href', 'set').mockImplementation(() => {});
    expect(await checkAuth({ requireAdmin: true })).toBeNull(); expect(set).toHaveBeenCalledWith('index.html');
  });

  it('redirects to login when admin check throws', async () => {
    const db = { from: vi.fn().mockReturnThis(), select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), single: vi.fn().mockRejectedValue(new Error('PGRST116')) };
    C.getDb.mockReturnValue(db); C.verifySessionWithServer.mockResolvedValue(true);
    M.isLoggedIn.mockReturnValue(true); M.getCurrentUser.mockReturnValue({ id: 'u3' });
    const set = vi.spyOn(window.location, 'href', 'set').mockImplementation(() => {});
    expect(await checkAuth({ requireAdmin: true })).toBeNull(); expect(set).toHaveBeenCalledWith('login.html');
  });
});
