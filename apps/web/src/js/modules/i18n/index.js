import { TRANSLATIONS } from './translations.js';
import { safeStorageGet, safeStorageSet } from '../core.js';

// ════════════════════════════════════════════════════════════════
// State
// ════════════════════════════════════════════════════════════════

const STORAGE_KEY = 'svu_lang';
let currentLang = safeStorageGet(STORAGE_KEY) || 'ar';

// ════════════════════════════════════════════════════════════════
// Core functions
// ════════════════════════════════════════════════════════════════

function t(key) {
  const lang = currentLang === 'en' ? 'en' : 'ar';
  return TRANSLATIONS[lang]?.[key] || TRANSLATIONS.ar[key] || key;
}

function setLang(lang) {
  if (!['ar', 'en'].includes(lang)) return;
  currentLang = lang;
  safeStorageSet(STORAGE_KEY, lang);
  applyLanguage(lang);
}

function getLang() {
  return currentLang;
}

function toggleLang() {
  setLang(currentLang === 'ar' ? 'en' : 'ar');
  return currentLang;
}

function applyLanguage(lang) {
  const isArabic = lang === 'ar';
  document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const text = t(key);
    if (el.tagName === 'INPUT') {
      el.placeholder = text;
    } else {
      el.textContent = text;
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
  });

  const titleEl = document.querySelector('title[data-i18n]');
  if (titleEl) {
    titleEl.textContent = t(titleEl.getAttribute('data-i18n'));
  }

  const langBtn = document.querySelector('[data-lang-toggle]');
  if (langBtn) {
    langBtn.textContent = isArabic ? 'EN' : 'AR';
  }
}

function initLang() {
  applyLanguage(currentLang);
}

// ════════════════════════════════════════════════════════════════
// Public API
// ════════════════════════════════════════════════════════════════

export { t, setLang, getLang, toggleLang, applyLanguage, initLang };

window.i18n = { t, setLang, getLang, toggleLang, applyLanguage, initLang };
