import { initializeTheme, applyTheme, getStoredTheme, toggleTheme } from './js/modules/core.js';
import { initLang, applyLanguage } from './js/modules/i18n.js';
import { log, openModal, closeModal } from './js/modules/shared.js';
import { getDb } from './js/modules/config.js';
import { escapeHtml } from './js/modules/core.js';

export { initializeTheme, applyTheme, getStoredTheme, toggleTheme, initLang, applyLanguage, log, getDb };

function updateWelcomeText(name) {
  const welcomeName = escapeHtml(name);
  const existing = document.getElementById('welcomeText');
  if (existing) {
    existing.textContent = 'مرحباً بك ' + welcomeName + '!';
  }
}

function setupThemeToggle() {
  const btn = document.getElementById('themeToggleBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const next = toggleTheme();
    const tip = btn.getAttribute('data-tooltip') || '';
    const labels = {
      light: btn.dataset.tooltipLight || 'الوضع الفاتح',
      dark: btn.dataset.tooltipDark || 'الوضع الداكن',
      system: btn.dataset.tooltipSystem || 'وضع النظام',
    };
    const isAr = (document.documentElement.lang || 'ar').startsWith('ar');
    btn.setAttribute('data-tooltip', isAr ? labels[next] || tip : tip);
  });
}

function setupLangToggle() {
  const btns = document.querySelectorAll('[data-lang-toggle]');
  btns.forEach((btn) => {
    btn.addEventListener('click', () => {
      applyLanguage();
      location.reload();
    });
  });
}

function setupForgotPasswordModal() {
  const openButtons = document.querySelectorAll('[data-action="forgot-password-open"]');
  const closeButtons = document.querySelectorAll('[data-action="forgot-password-close"]');
  const form = document.getElementById('forgotPasswordForm');
  const modal = document.getElementById('forgotPasswordModal');

  const open = () => openModal('forgotPasswordModal');
  const close = () => closeModal('forgotPasswordModal');

  openButtons.forEach((btn) => btn.addEventListener('click', open));
  closeButtons.forEach((btn) => btn.addEventListener('click', close));

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) close();
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const emailField = document.getElementById('resetEmail');
      const resetBtn = document.getElementById('resetBtn');
      const email = (emailField?.value || '').trim();
      if (!email || !email.includes('@')) {
        log.warn('Invalid email');
        return;
      }
      if (!resetBtn) return;
      resetBtn.disabled = true;
      const originalText = resetBtn.textContent;
      resetBtn.textContent = 'جاري الإرسال...';
      try {
        const db = await getDb();
        if (!db) throw new Error('Supabase not configured');
        const { error } = await db.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + '/reset-password.html',
        });
        if (error) throw error;
        log.info('Password reset email sent');
        close();
      } catch (err) {
        log.error(err);
      } finally {
        resetBtn.disabled = false;
        resetBtn.textContent = originalText;
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initializeTheme();
  initLang();
  setupThemeToggle();
  setupLangToggle();
  setupForgotPasswordModal();

  const stored = getStoredTheme?.() || 'system';
  const btn = document.getElementById('themeToggleBtn');
  if (btn) {
    const sun = btn.querySelector('.icon-sun');
    const moon = btn.querySelector('.icon-moon');
    const system = btn.querySelector('.icon-system');
    if (sun) sun.classList.toggle('hidden', stored !== 'light');
    if (moon) moon.classList.toggle('hidden', stored !== 'dark');
    if (system) system.classList.toggle('hidden', stored !== 'system');
  }
});
