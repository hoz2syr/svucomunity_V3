import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../js/modules/core.js', () => ({
  escapeHtml: (s) => s,
  clearUserSession: vi.fn(),
  saveUserSession: vi.fn(),
  getCurrentUser: vi.fn(),
  handleLoginError: (err) => err.message || 'خطأ في تسجيل الدخول',
  showToast: vi.fn(),
  loadCurrentUser: vi.fn(),
}));

vi.mock('../js/modules/config.js', () => ({
  getDb: vi.fn(),
}));

vi.mock('../js/modules/shared.js', () => ({
  getCurrentLang: vi.fn(() => 'ar'),
  showToast: vi.fn(),
}));

describe('page-login redirect allowlist', () => {
  let originalLocation;

  beforeEach(() => {
    originalLocation = window.location;
    delete window.location;
    window.location = { href: '' };
  });

  afterEach(() => {
    window.location = originalLocation;
  });

  it('allows dashboard.html', async () => {
    const { isAllowedRedirect } = await import('../js/modules/page-login.js');
    expect(isAllowedRedirect('/dashboard.html')).toBe(true);
    expect(isAllowedRedirect('dashboard.html')).toBe(true);
  });

  it('allows index.html', async () => {
    const { isAllowedRedirect } = await import('../js/modules/page-login.js');
    expect(isAllowedRedirect('/index.html')).toBe(true);
  });

  it('allows paths with hash anchors', async () => {
    const { isAllowedRedirect } = await import('../js/modules/page-login.js');
    expect(isAllowedRedirect('#section')).toBe(true);
    expect(isAllowedRedirect('/index.html#top')).toBe(true);
  });

  it('allows courses.html and groups.html and profile.html', async () => {
    const { isAllowedRedirect } = await import('../js/modules/page-login.js');
    expect(isAllowedRedirect('courses.html')).toBe(true);
    expect(isAllowedRedirect('groups.html')).toBe(true);
    expect(isAllowedRedirect('profile.html')).toBe(true);
  });

  it('rejects external redirect', async () => {
    const { isAllowedRedirect } = await import('../js/modules/page-login.js');
    expect(isAllowedRedirect('https://evil.com/phish')).toBe(false);
  });

  it('rejects disallowed path', async () => {
    const { isAllowedRedirect } = await import('../js/modules/page-login.js');
    expect(isAllowedRedirect('/admin/secret')).toBe(false);
    expect(isAllowedRedirect('random-page.html')).toBe(false);
  });

  it('rejects javascript: URLs', async () => {
    const { isAllowedRedirect } = await import('../js/modules/page-login.js');
    expect(isAllowedRedirect('javascript:alert(1)')).toBe(false);
  });

  it('rejects null/undefined/empty non-anchor strings', async () => {
    const { isAllowedRedirect } = await import('../js/modules/page-login.js');
    expect(isAllowedRedirect('')).toBe(false);
    expect(isAllowedRedirect(null)).toBe(false);
    expect(isAllowedRedirect(undefined)).toBe(false);
    expect(isAllowedRedirect(123)).toBe(false);
  });
});

describe('page-login rate limiting', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('starts with 0 failed attempts', () => {
    expect(sessionStorage.getItem('svu_failed_login_attempts')).toBeNull();
  });

  it('records failed login attempts', async () => {
    const { recordFailedLogin } = await import('../js/modules/page-login.js');
    recordFailedLogin();
    const raw = sessionStorage.getItem('svu_failed_login_attempts');
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw);
    expect(parsed.count).toBe(1);
    expect(parsed.resetAt).toBeGreaterThan(Date.now());
  });

  it('increments failed attempts on subsequent calls', async () => {
    const { recordFailedLogin } = await import('../js/modules/page-login.js');
    recordFailedLogin();
    recordFailedLogin();
    recordFailedLogin();
    const raw = sessionStorage.getItem('svu_failed_login_attempts');
    const parsed = JSON.parse(raw);
    expect(parsed.count).toBe(3);
  });

  it('returns 0 cooldown before threshold', async () => {
    const { getCooldownRemaining } = await import('../js/modules/page-login.js');
    expect(getCooldownRemaining()).toBe(0);
  });

  it('activates cooldown after 5 failed attempts', async () => {
    const { recordFailedLogin, getCooldownRemaining } = await import('../js/modules/page-login.js');
    for (let i = 0; i < 5; i++) recordFailedLogin();
    expect(getCooldownRemaining()).toBeGreaterThan(0);
  });

  it('clears rate limit on successful login', async () => {
    const { recordFailedLogin, clearLoginRateLimit } = await import('../js/modules/page-login.js');
    recordFailedLogin();
    recordFailedLogin();
    clearLoginRateLimit();
    expect(sessionStorage.getItem('svu_failed_login_attempts')).toBeNull();
    expect(sessionStorage.getItem('svu_login_cooldown')).toBeNull();
  });

  it('resets count after cooldown expiry', async () => {
    const { recordFailedLogin, getCooldownRemaining } = await import('../js/modules/page-login.js');
    recordFailedLogin();
    const raw = sessionStorage.getItem('svu_failed_login_attempts');
    const parsed = JSON.parse(raw);
    const pastResetAt = parsed.resetAt - 1000;
    sessionStorage.setItem('svu_failed_login_attempts', JSON.stringify({ count: 5, resetAt: pastResetAt }));
    expect(getCooldownRemaining()).toBe(0);
  });

  it('formats cooldown message with seconds', async () => {
    const { formatCooldown } = await import('../js/modules/page-login.js');
    const msg = formatCooldown(65000);
    expect(msg).toContain('ثانية');
    expect(msg).toContain('65');
  });
});
