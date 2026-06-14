import { initializeTheme, applyTheme, getStoredTheme, toggleTheme } from './js/modules/core.js';
import { initLang, toggleLang } from './js/modules/i18n.js';
import { log, openModal, closeModal, logout } from './js/modules/shared.js';
import { getDb } from './js/modules/config.js';
import { escapeHtml } from './js/modules/core.js';

export { initializeTheme, applyTheme, getStoredTheme, toggleTheme, initLang, toggleLang, log, getDb };

function getPageName() {
  const path = window.location.pathname;
  const normalized = path.replace(/\/+$/, '') || '/';
  if (normalized === '/dashboard' || normalized.startsWith('/dashboard/')) return 'dashboard';
  if (normalized === '/courses' || normalized.startsWith('/courses/')) return 'courses';
  return null;
}

function getPageModuleName(page) {
  const map = {
    dashboard: './js/modules/page-dashboard.js',
    courses: './js/modules/page-courses.js',
  };
  return map[page] || null;
}

async function loadPageModule(page) {
  const moduleName = getPageModuleName(page);
  if (!moduleName) return;
  try {
    await import(moduleName);
  } catch (err) {
    log.error('Failed to load page module:', err);
  }
}

function setupIntersectionObserver() {
  if (!('IntersectionObserver' in window)) return;
  const lazyEls = document.querySelectorAll('[data-lazy-init]');
  if (!lazyEls.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        if (el.dataset.lazyInit) {
          el.dispatchEvent(new CustomEvent('lazy-content-visible'));
          observer.unobserve(el);
        }
      }
    });
  }, { rootMargin: '200px 0px' });
  lazyEls.forEach(el => observer.observe(el));
}

function lazyLoadImages() {
  document.querySelectorAll('img:not([loading])').forEach(img => {
    img.setAttribute('loading', 'lazy');
  });
}

function applyThemeIconState() {
  const stored = getStoredTheme?.() || 'system';
  const btn = document.getElementById('themeToggleBtn');
  if (!btn) return;
  const sun = btn.querySelector('.icon-sun');
  const moon = btn.querySelector('.icon-moon');
  const system = btn.querySelector('.icon-system');
  if (sun) sun.classList.toggle('hidden', stored !== 'light');
  if (moon) moon.classList.toggle('hidden', stored !== 'dark');
  if (system) system.classList.toggle('hidden', stored !== 'system');
}

function deferNonCriticalInit() {
  const run = () => {
    applyThemeIconState();
    setupIntersectionObserver();
    lazyLoadImages();
  };
  if ('requestIdleCallback' in window) {
    requestIdleCallback(run);
  } else {
    setTimeout(run, 1);
  }
}

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
      toggleLang();
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
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        log.warn('Invalid email format');
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
  initLang();
  setupThemeToggle();
  setupLangToggle();
  setupForgotPasswordModal();

  const page = getPageName();
  if (page) {
    loadPageModule(page);
  }

  deferNonCriticalInit();
});

window.addEventListener('svu-theme-change', (e) => {
  applyTheme(e.detail.theme);
});
