/**
 * SVU Community — Login Page module
 */
import '../../pages/login.css';

import { escapeHtml, clearUserSession, saveUserSession, getCurrentUser, handleLoginError, loadCurrentUser } from './core.js';
import { getDb } from './config.js';
import { showToast, getCurrentLang } from './shared.js';
import { getCsrfHeaders } from './csrf.js';
import { randomAuthDelay } from '../utils/security.js';

async function isSupabaseSessionActive(db) {
  if (!db) return false;
  try {
    const { data: { user } } = await db.auth.getUser();
    return !!user;
  } catch {
    return false;
  }
}

function i18nT(key, fallback) {
  return document.documentElement.getAttribute('data-i18n-' + key) || window.i18n?.t?.(key) || fallback || key;
}

const EYE_VISIBLE =
  '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>';
const EYE_HIDDEN =
  '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268 2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>';

const FAILED_LOGIN_KEY = 'svu_failed_login_attempts';
const LOGIN_COOLDOWN_KEY = 'svu_login_cooldown';
const MAX_FAILED_ATTEMPTS = 5;
const COOLDOWN_WINDOW_MS = 60_000;

function getFailedAttempts() {
  try {
    const raw = sessionStorage.getItem(FAILED_LOGIN_KEY);
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    if (Date.now() > parsed.resetAt) return 0;
    return parsed.count || 0;
  } catch {
    return 0;
  }
}

function recordFailedLogin() {
  try {
    const now = Date.now();
    const existing = JSON.parse(sessionStorage.getItem(FAILED_LOGIN_KEY) || '{}');
    const count = (existing.count || 0) + 1;
    const resetAt = now + COOLDOWN_WINDOW_MS;
    sessionStorage.setItem(FAILED_LOGIN_KEY, JSON.stringify({ count, resetAt }));
    if (count >= MAX_FAILED_ATTEMPTS) {
      sessionStorage.setItem(LOGIN_COOLDOWN_KEY, String(resetAt));
    }
  } catch {
    // ignore storage errors
  }
}

function getCooldownRemaining() {
  try {
    const until = Number(sessionStorage.getItem(LOGIN_COOLDOWN_KEY));
    if (!until) return 0;
    const remaining = until - Date.now();
    if (remaining <= 0) {
      sessionStorage.removeItem(LOGIN_COOLDOWN_KEY);
      sessionStorage.removeItem(FAILED_LOGIN_KEY);
      return 0;
    }
    return remaining;
  } catch {
    return 0;
  }
}

function clearLoginRateLimit() {
  try {
    sessionStorage.removeItem(FAILED_LOGIN_KEY);
    sessionStorage.removeItem(LOGIN_COOLDOWN_KEY);
  } catch {
    // ignore storage errors
  }
}

function formatCooldown(ms) {
  const seconds = Math.max(1, Math.ceil(ms / 1000));
  return i18nT(
    'loginCooldown',
    `محاولات كثيرة جداً. يرجى الانتظار ${seconds} ثانية قبل المحاولة مرة أخرى`
  );
}

const ALLOWED_REDIRECTS = new Set([
  'dashboard.html',
  'index.html',
  'courses.html',
  'groups.html',
  'profile.html',
]);

function isAllowedRedirect(target) {
  if (!target || typeof target !== 'string') return false;
  try {
    const url = new URL(target, window.location.origin);
    if (url.origin !== window.location.origin) return false;
    const path = url.pathname.split('/').pop() || url.pathname;
    if (ALLOWED_REDIRECTS.has(path)) return true;
    if (path.startsWith('#') || path === '') return true;
    return false;
  } catch {
    return false;
  }
}

const REDIRECT_URL = 'dashboard.html';

let passwordVisible = false;
let redirectInProgress = false;

function redirectToDashboard(message = 'مرحباً بك مرة أخرى') {
  if (redirectInProgress) return;
  redirectInProgress = true;
  showToast(message, 'success');
  setTimeout(() => {
    window.location.href = REDIRECT_URL;
  }, 1200);
}

function updatePasswordIcon() {
  const svg = document.getElementById('toggleLoginPassword');
  if (!svg) return;
  svg.innerHTML = passwordVisible ? EYE_HIDDEN : EYE_VISIBLE;
}

function togglePassword() {
  const input = document.getElementById('loginPassword');
  if (!input) return;
  passwordVisible = !passwordVisible;
  input.type = passwordVisible ? 'text' : 'password';
  updatePasswordIcon();
  updatePasswordToggleLabel();
}

async function checkExistingSession() {
  try {
    const db = getDb();
    if (!db) {
      clearUserSession();
      return;
    }

    const hasActiveSession = await isSupabaseSessionActive(db);
    if (!hasActiveSession) {
      clearUserSession();
      return;
    }

    redirectToDashboard('مرحباً بك مرة أخرى');
  } catch (err) {
    console.error('[login] Session check failed:', err);
  }
}

async function handleLoginSubmit(e) {
  e.preventDefault();

  const btn = document.getElementById('loginBtn');
  const loginEmailField = document.getElementById('loginIdentifier');
  const passwordField = document.getElementById('loginPassword');

  if (!btn || !loginEmailField || !passwordField) return;

  const loginEmail = (loginEmailField.value || '').trim();
  const password = passwordField.value || '';

  const remainingCooldown = getCooldownRemaining();
  if (remainingCooldown > 0) {
    showToast(formatCooldown(remainingCooldown), 'error');
    return;
  }

  if (!loginEmail || !password) {
    showToast('أدخل البريد وكلمة المرور', 'error');
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail)) {
    showToast('صيغة البريد الإلكتروني غير صحيحة', 'error');
    return;
  }

  if (password.length < 8) {
    showToast(i18nT('loginPasswordTooShort') || 'كلمة المرور قصيرة جداً (8 أحرف على الأقل)', 'error');
    return;
  }
  if (!/[A-Z]/.test(password)) {
    showToast(i18nT('loginPasswordMissingUppercase') || 'يجب أن تحتوي كلمة المرور على حرف كبير واحد على الأقل', 'error');
    return;
  }
  if (!/[a-z]/.test(password)) {
    showToast(i18nT('loginPasswordMissingLowercase') || 'يجب أن تحتوي كلمة المرور على حرف صغير واحد على الأقل', 'error');
    return;
  }
  if (!/[0-9]/.test(password)) {
    showToast(i18nT('loginPasswordMissingNumber') || 'يجب أن تحتوي كلمة المرور على رقم واحد على الأقل', 'error');
    return;
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    showToast(i18nT('loginPasswordMissingSymbol') || 'يجب أن تحتوي كلمة المرور على رمز خاص واحد على الأقل', 'error');
    return;
  }

  btn.disabled = true;
  let spinner = null;
  let btnText = null;
  spinner = document.getElementById('loginSpinner');
  btnText = document.getElementById('loginBtnText');
  if (spinner) spinner.classList.remove('hidden');
  if (btnText) btnText.textContent = i18nT('loginProcessing', 'جاري المعالجة...');

  try {
    const db = getDb();
    if (!db) throw new Error('تعذر الاتصال بالخادم');

    const csrfHeaders = getCsrfHeaders();

    const { data: authData, error: authError } = await db.auth.signInWithPassword({
      email: loginEmail,
      password,
    }, {
      headers: csrfHeaders,
    });

    if (authError) {
      await randomAuthDelay();
      recordFailedLogin();
      throw authError;
    }

    const userData = await loadCurrentUser(db);
    if (!userData) {
      clearLoginRateLimit();
      throw new Error('تعذر تحميل بيانات المستخدم');
    }

    clearLoginRateLimit();
    saveUserSession(userData);

    const welcomeName = escapeHtml(userData.first_name || userData.username);
    showToast('مرحباً بك ' + welcomeName + '!', 'success');

    redirectToDashboard();
  } catch (error) {
    const safeMessage = handleLoginError(error);
    showToast(safeMessage, 'error');
  } finally {
    btn.disabled = false;
    if (spinner) spinner.classList.add('hidden');
    if (btnText) btnText.textContent = i18nT('loginBtn', 'تسجيل الدخول');
  }
}

async function handleForgotPasswordSubmit(e) {
  e.preventDefault();
  const emailField = document.getElementById('resetEmail');
  const resetBtn = document.getElementById('resetBtn');
  if (!emailField || !resetBtn) return;

  const email = (emailField.value || '').trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast('صيغة البريد الإلكتروني غير صحيحة', 'error');
    return;
  }

  resetBtn.disabled = true;
  try {
    const db = getDb();
    if (!db) throw new Error('تعذر الاتصال بالخادم');

    const { error } = await db.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password.html',
    });

    if (error) throw error;

    showToast('تم إرسال رابط الاستعادة إلى بريدك الإلكتروني', 'success');
    closeForgotPasswordModal();
  } catch (err) {
    console.error('[login] Password reset failed:', err);
    showToast(handleLoginError(err), 'error');
  } finally {
    resetBtn.disabled = false;
  }
}

function openForgotPasswordModal() {
  const modal = document.getElementById('forgotPasswordModal');
  if (!modal) return;
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  const firstInput = modal.querySelector('input');
  firstInput?.focus();
}

function closeForgotPasswordModal() {
  const modal = document.getElementById('forgotPasswordModal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function setupForgotPasswordModal() {
  const modal = document.getElementById('forgotPasswordModal');
  if (!modal) return;

  document.querySelector('[data-action="forgot-password-open"]')?.addEventListener('click', openForgotPasswordModal);
  document.querySelector('[data-action="forgot-password-close"]')?.addEventListener('click', closeForgotPasswordModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeForgotPasswordModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeForgotPasswordModal();
    }
  });

  document.getElementById('forgotPasswordForm')?.addEventListener('submit', handleForgotPasswordSubmit);
}

function setupLoginForm() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  const loginEmailField = document.getElementById('loginIdentifier');
  const passwordField = document.getElementById('loginPassword');

  form.addEventListener('submit', handleLoginSubmit);

  document.getElementById('togglePasswordBtn')?.addEventListener('click', togglePassword);
}

function updatePasswordToggleLabel() {
  const btn = document.getElementById('toggleLoginPassword');
  if (!btn) return;
  const isAr = getCurrentLang().startsWith('ar');
  btn.setAttribute('aria-label', passwordVisible 
    ? (isAr ? 'إخفاء كلمة المرور' : 'Hide password') 
    : (isAr ? 'إظهار كلمة المرور' : 'Show password'));
  btn.setAttribute('aria-pressed', String(passwordVisible));
}

document.addEventListener('DOMContentLoaded', () => {
  setupLoginForm();
  setupForgotPasswordModal();
  updatePasswordToggleLabel();
  checkExistingSession();
});
