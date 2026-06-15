import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockBuildPhone = vi.fn((raw) => '+963' + (raw || '').replace(/\D/g, ''));
const mockSetFormLoading = vi.fn();
const mockValidateUsername = vi.fn(() => null);
const mockValidateMajor = vi.fn(() => null);
const mockValidatePhone = vi.fn(() => null);
const mockValidatePassword = vi.fn(() => null);
const mockFormatFieldError = vi.fn((f) => (f === 'username' ? 'اسم المستخدم مسجّل مسبقاً' : 'البريد الإلكتروني مسجّل مسبقاً'));
const mockGetCurrentLang = vi.fn(() => 'ar');
const mockI18nT = vi.fn((k) => k);

vi.mock('../js/modules/page-register/register-ui.js', () => ({
  buildPhone: mockBuildPhone,
  setFormLoading: mockSetFormLoading,
}));

vi.mock('../js/modules/page-register/validation.js', () => ({
  validateUsername: mockValidateUsername,
  validateMajor: mockValidateMajor,
  validatePhone: mockValidatePhone,
  validatePassword: mockValidatePassword,
  formatFieldError: mockFormatFieldError,
  getCurrentLang: mockGetCurrentLang,
  i18nT: mockI18nT,
}));

const mockShowToast = vi.fn();
const mockHandleRegisterError = vi.fn((err) => err?.message || 'خطأ في التسجيل');

vi.mock('../js/modules/core.js', () => ({
  escapeHtml: (s) => s,
  handleRegisterError: mockHandleRegisterError,
  showToast: mockShowToast,
  safeStorageGet: vi.fn(() => 'ar'),
  safeStorageSet: vi.fn(),
}));

const mockGetCountryName = vi.fn((c) => c.code);
const MOCK_COUNTRIES = [
  { code: 'sy', dial: '+963', localPfx: ['0'], minLen: 7, maxLen: 10, flag: '🇸🇾', name: 'سوريا' },
];

vi.mock('../js/modules/shared.js', () => ({
  getCountryName: mockGetCountryName,
  COUNTRIES: MOCK_COUNTRIES,
  loadSVUCourses: vi.fn(() => []),
  getMajorsList: vi.fn(() => []),
}));

describe('register-api', () => {
  let mockFromChain;
  let mockDb;

  beforeEach(async () => {
    vi.resetModules();
    mockFromChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn(),
      auth: { signUp: vi.fn() },
    };
    mockDb = {
      from: vi.fn(() => mockFromChain),
      auth: mockFromChain.auth,
    };
    const { state } = await import('../js/modules/page-register/register-state.js');
    state.db = mockDb;
    mockShowToast.mockClear();
    mockHandleRegisterError.mockClear();
    mockBuildPhone.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('submitRegisterForm', () => {
    const baseDOM = () => ({
      username: { value: 'test_123456' },
      firstName: { value: 'أحمد' },
      middleName: { value: 'محمد' },
      lastName: { value: 'علي' },
      email: { value: 'test@example.com' },
      password: { value: 'password123' },
      confirmPassword: { value: 'password123' },
      phone: { value: '0933123456' },
      majorInput: { classList: { add: vi.fn(), remove: vi.fn() } },
      majorError: { classList: { add: vi.fn(), remove: vi.fn() } },
      phoneError: { classList: { add: vi.fn(), remove: vi.fn() } },
      registerBtn: { disabled: false, classList: { add: vi.fn(), remove: vi.fn() } },
      matchMsg: { classList: { toggle: vi.fn() } },
      strengthLabel: { textContent: '', style: {} },
      s1: { style: {} },
      s2: { style: {} },
      s3: { style: {} },
      s4: { style: {} },
    });

    let originalGID;

    beforeEach(() => {
      originalGID = window.document.getElementById.bind(window.document);
    });

    afterEach(() => {
      window.document.getElementById = originalGID;
    });

    it('does not submit if already submitting', async () => {
      const { state } = await import('../js/modules/page-register/register-state.js');
      state._submitting = true;
      const { submitRegisterForm } = await import('../js/modules/page-register/register-api.js');
      await submitRegisterForm();
      expect(mockDb.auth.signUp).not.toHaveBeenCalled();
      state._submitting = false;
    });

    it('returns early when db is null', async () => {
      const { state } = await import('../js/modules/page-register/register-state.js');
      state.db = null;
      const { submitRegisterForm } = await import('../js/modules/page-register/register-api.js');
      await submitRegisterForm();
      expect(mockShowToast).toHaveBeenCalled();
      state.db = mockDb;
    });

    it('blocks duplicate username from DB check', async () => {
      mockFromChain.maybeSingle.mockResolvedValue({ data: { username: 'taken' }, error: null });
      window.document.getElementById = vi.fn((id) => baseDOM()[id] || null);
      const { submitRegisterForm } = await import('../js/modules/page-register/register-api.js');
      await submitRegisterForm();
      expect(mockDb.auth.signUp).not.toHaveBeenCalled();
    });

    it('blocks duplicate email from DB check', async () => {
      mockFromChain.maybeSingle
        .mockResolvedValueOnce({ data: null, error: null })
        .mockResolvedValueOnce({ data: { email: 'taken@example.com' }, error: null });
      window.document.getElementById = vi.fn((id) => baseDOM()[id] || null);
      const { submitRegisterForm } = await import('../js/modules/page-register/register-api.js');
      await submitRegisterForm();
      expect(mockDb.auth.signUp).not.toHaveBeenCalled();
    });

    it('signs up with correct payload when no duplicates', async () => {
      mockFromChain.maybeSingle.mockResolvedValue({ data: null, error: null });
      mockDb.auth.signUp.mockResolvedValue({
        data: { session: { access_token: 'token', refresh_token: 'refresh' } },
        error: null,
      });
      window.document.getElementById = vi.fn((id) => {
        if (id === 'username') return { value: 'ahmed_123456' };
        if (id === 'email') return { value: 'ahmed@example.com' };
        if (id === 'password') return { value: 'SecurePass1!' };
        if (id === 'confirmPassword') return { value: 'SecurePass1!' };
        if (id === 'phone') return { value: '0933123456' };
        if (id === 'firstName') return { value: 'أحمد' };
        if (id === 'middleName') return { value: 'محمد' };
        if (id === 'lastName') return { value: 'علي' };
        if (id === 'majorInput') return { value: 'CS', classList: { add: vi.fn(), remove: vi.fn() } };
        if (id === 'majorError') return { classList: { add: vi.fn(), remove: vi.fn() } };
        if (id === 'phoneError') return { classList: { add: vi.fn(), remove: vi.fn() } };
        if (id === 'registerBtn') return { disabled: false, classList: { add: vi.fn(), remove: vi.fn() } };
        if (id === 'matchMsg') return { classList: { toggle: vi.fn() } };
        if (id === 'strengthLabel') return { textContent: '', style: {} };
        if (id === 's1') return { style: {} };
        if (id === 's2') return { style: {} };
        if (id === 's3') return { style: {} };
        if (id === 's4') return { style: {} };
        return null;
      });
      const { submitRegisterForm } = await import('../js/modules/page-register/register-api.js');
      await submitRegisterForm();
      expect(mockDb.auth.signUp).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'ahmed@example.com',
          password: 'SecurePass1!',
          options: expect.objectContaining({
            data: expect.objectContaining({
              username: 'ahmed_123456',
              first_name: 'أحمد',
              last_name: 'علي',
            }),
          }),
        })
      );
    });

    it('handles duplicate username error from signUp API', async () => {
      mockFromChain.maybeSingle.mockResolvedValue({ data: null, error: null });
      mockDb.auth.signUp.mockResolvedValue({
        data: null,
        error: { message: 'duplicate key value violates unique constraint "users_username_key"' },
      });
      window.document.getElementById = vi.fn((id) => baseDOM()[id] || null);
      const { submitRegisterForm } = await import('../js/modules/page-register/register-api.js');
      await submitRegisterForm();
      expect(mockShowToast).toHaveBeenCalled();
    });

    it('handles duplicate email error from signUp API', async () => {
      mockFromChain.maybeSingle.mockResolvedValue({ data: null, error: null });
      mockDb.auth.signUp.mockResolvedValue({
        data: null,
        error: { message: 'duplicate key value violates unique constraint "users_email_key"' },
      });
      window.document.getElementById = vi.fn((id) => baseDOM()[id] || null);
      const { submitRegisterForm } = await import('../js/modules/page-register/register-api.js');
      await submitRegisterForm();
      expect(mockShowToast).toHaveBeenCalled();
    });

    it('queries users table for username and email before signup', async () => {
      mockFromChain.maybeSingle.mockResolvedValue({ data: null, error: null });
      mockDb.auth.signUp.mockResolvedValue({
        data: { session: { access_token: 'token', refresh_token: 'refresh' } },
        error: null,
      });
      window.document.getElementById = vi.fn((id) => {
        if (id === 'username') return { value: 'newuser_999700' };
        if (id === 'email') return { value: 'fresh@example.com' };
        return baseDOM()[id] || null;
      });
      const { submitRegisterForm } = await import('../js/modules/page-register/register-api.js');
      await submitRegisterForm();
      expect(mockFromChain.select).toHaveBeenCalledWith('username,email');
      expect(mockFromChain.eq).toHaveBeenCalled();
      expect(mockDb.auth.signUp).toHaveBeenCalled();
    });

    it('shows toast on unexpected DB error during duplicate check', async () => {
      mockFromChain.maybeSingle.mockRejectedValue(new Error('connection failed'));
      mockDb.auth.signUp.mockResolvedValue({ data: null, error: null });
      window.document.getElementById = vi.fn((id) => baseDOM()[id] || null);
      const { submitRegisterForm } = await import('../js/modules/page-register/register-api.js');
      await submitRegisterForm();
      expect(mockShowToast).toHaveBeenCalled();
    });
  });
});
