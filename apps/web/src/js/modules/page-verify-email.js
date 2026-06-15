/**
 * ════════════════════════════════════════════════════════════════
 * SVU Community — Email Verification Page
 * ════════════════════════════════════════════════════════════════
 */

import { escapeHtml } from './core.js';

let db = null;

document.addEventListener('DOMContentLoaded', function() {
  window.initializeTheme?.();
  window.i18n?.initLang?.();
  db = window.initSupabase?.();

  const loadingDiv = document.getElementById('verifyLoading');
  const successDiv = document.getElementById('verifySuccess');
  const errorDiv = document.getElementById('verifyError');
  const errorMsg = document.getElementById('verifyErrorMsg');

  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const accessToken = hashParams.get('access_token');
  const refreshToken = hashParams.get('refresh_token');
  const type = hashParams.get('type');
  const errorParam = escapeHtml(hashParams.get('error') || '');

  if (errorParam) {
    showError(window.i18n?.t('verifyEmailError') || 'حدث خطأ أثناء التفعيل');
    return;
  }

  if (type === 'signup' && accessToken && db) {
    db.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    }).then(function(result) {
      if (result.error) {
        showError(result.error.message);
        return;
      }
      showSuccess();
      setTimeout(function() {
        db.auth.signOut().then(function() {
          window.location.href = 'login.html';
        });
      }, 3000);
    }).catch(function(err) {
      showError(err.message);
    });
  } else if (type === 'recovery' && accessToken) {
    window.location.href = 'reset-password.html' + window.location.hash;
  } else if (!accessToken) {
    loadingDiv.classList.add('hidden');
    errorDiv.classList.remove('hidden');
    const errorTitle = document.querySelector('#verifyError h3');
    if (errorTitle) {
      errorTitle.textContent =
        window.i18n?.t('verifyEmailNoToken') || 'لم يتم العثور على رابط التفعيل';
    }
    if (errorMsg) {
      errorMsg.textContent =
        window.i18n?.t('verifyEmailCheckInbox') || 'تحقق من بريدك الإلكتروني واضغط على رابط التفعيل.';
    }
    const resendBtn = document.getElementById('resendBtn');
    if (resendBtn) resendBtn.classList.remove('hidden');
  } else {
    showError(window.i18n?.t('verifyEmailUnknown') || 'نوع الرابط غير معروف');
  }

  function showSuccess() {
    loadingDiv.classList.add('hidden');
    successDiv.classList.remove('hidden');
  }

  function showError(message) {
    loadingDiv.classList.add('hidden');
    errorDiv.classList.remove('hidden');
    errorMsg.textContent = message || window.i18n?.t('verifyEmailError') || 'حدث خطأ أثناء التفعيل';
  }
});

async function resendVerification() {
  const btn = document.getElementById('resendBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="flex items-center justify-center gap-2"><svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> ' + (window.i18n?.t('loading') || 'Loading...') + '</span>';

  try {
    let email = '';

    const urlParams = new URLSearchParams(window.location.search);
    email = (urlParams.get('email') || '').trim();

    if (!email) {
      const storedEmail = safeStorageGet('svu_pending_verification_email');
      if (storedEmail) {
        email = storedEmail;
      }
    }

    if (!email) {
      const promptText = window.i18n?.t('verifyEmailEnterEmailPrompt') || 'أدخل بريدك الإلكتروني لإعادة إرسال رابط التفعيل:';
      email = (window.prompt(promptText) || '').trim();
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast(window.i18n?.t('verifyEmailInvalidEmail') || 'صيغة البريد الإلكتروني غير صحيحة', 'error');
      return;
    }

    if (db) {
      const { error } = await db.auth.resend({
        type: 'signup',
        email: email,
      });
      if (error) throw error;
    }

    showToast(window.i18n?.t('verifyEmailResent') || 'تم إرسال رابط التفعيل مرة أخرى!', 'success');
  } catch (error) {
    showToast(error.message || window.i18n?.t('verifyEmailResendError') || 'فشل إرسال رابط التفعيل', 'error');
  } finally {
    const resendBtn = document.getElementById('resendBtn');
    if (resendBtn) {
      resendBtn.disabled = false;
      resendBtn.innerHTML = '<span data-i18n="verifyEmailResend">' + (window.i18n?.t('verifyEmailResend') || 'إعادة إرسال رابط التفعيل') + '</span>';
    }
  }
}

function safeStorageGet(key) {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
  } catch {
    // storage unavailable
  }
  return null;
}
