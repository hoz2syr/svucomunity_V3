/**
 * SVU Community — Login Page module
 */
import { escapeHtml, clearUserSession, saveUserSession, getCurrentUser, AUTH_CONFIG, handleLoginError } from './core.js';
import { verifySessionWithServer, getDb } from './config.js';
import { showToast, getCurrentLang } from './shared.js';

function i18nT(key, fallback) {
  return document.documentElement.getAttribute('data-i18n-' + key) || window.i18n?.t?.(key) || fallback || key;
}

const EYE_VISIBLE =
  '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>';
const EYE_HIDDEN =
  '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268 2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>';

let passwordVisible = false;

function updatePasswordIcon() {
  const icon = document.getElementById('toggleLoginPassword');
  if (!icon) return;
  const svg = icon.querySelector('svg');
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
      if (isLoggedIn()) {
        const userData = getCurrentUser();
        if (userData?.id) {
          showToast('مرحباً بك مرة أخرى', 'success');
          setTimeout(() => {
            window.location.href = 'dashboard.html';
          }, 1200);
        } else {
          clearUserSession();
        }
      }
      return;
    }

    const isValid = await verifySessionWithServer(db);
    if (!isValid) return;

    const userData = getCurrentUser();
    if (userData?.id) {
      showToast('مرحباً بك مرة أخرى', 'success');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1200);
    } else {
      clearUserSession();
    }
  } catch (err) {
    console.error('[login] Session check failed:', err);
    clearUserSession();
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

  btn.disabled = true;
  let spinner = null;
  let btnText = null;
  spinner = document.getElementById('loginSpinner');
  btnText = document.getElementById('loginBtnText');
  if (spinner) spinner.classList.remove('hidden');
  if (btnText) btnText.textContent = 'جاري المعالجة...';

  try {
    const db = getDb();
    if (!db) throw new Error('تعذر الاتصال بالخادم');

    const { data: authData, error: authError } = await db.auth.signInWithPassword({
      email: loginEmail,
      password,
    });

    if (authError) throw authError;

    const user = authData.user;
    const meta = user.user_metadata || {};
    const userData = {
      id: user.id,
      username: meta.username || user.email?.split('@')[0] || '',
      email: user.email || '',
      first_name: meta.first_name || '',
      middle_name: meta.middle_name || '',
      last_name: meta.last_name || '',
      major: meta.major || '',
      phone: meta.phone || '',
      avatar_url: meta.avatar_url || '',
    };

    saveUserSession(userData);

    const welcomeName = escapeHtml(userData.first_name || userData.username);
    showToast('مرحباً بك ' + welcomeName + '!', 'success');

    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1400);
  } catch (error) {
    const safeMessage = handleLoginError(error);
    showToast(safeMessage, 'error');
  } finally {
    btn.disabled = false;
    if (spinner) spinner.classList.add('hidden');
    if (btnText) btnText.textContent = 'تسجيل الدخول';
  }
}

function setupLoginForm() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  const loginEmailField = document.getElementById('loginIdentifier');
  const passwordField = document.getElementById('loginPassword');
  if (loginEmailField) loginEmailField.setAttribute('autocomplete', 'email');
  if (passwordField) passwordField.setAttribute('autocomplete', 'current-password');

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
  updatePasswordToggleLabel();
  checkExistingSession();
});
