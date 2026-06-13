import { useState, useEffect, useCallback, createContext, useContext, useMemo } from 'react';
import type { Language, I18nState, I18nAPI } from './types';

const STORAGE_KEY = 'svu_lang';

function getInitialLang(): Language {
  try {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (stored === 'en') return 'en';
  } catch {}
  return 'ar';
}

function applyLocale(state: { lang: Language; dir: 'rtl' | 'ltr' }) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('dir', state.dir);
  document.documentElement.setAttribute('lang', state.lang);
  document.documentElement.lang = state.lang;
}

const I18nContext = createContext<I18nAPI | null>(null);

function computeDir(lang: Language): 'rtl' | 'ltr' {
  return lang === 'ar' ? 'rtl' : 'ltr';
}

function useI18nContext(): I18nAPI {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    const lang = getInitialLang();
    return {
      state: { lang, dir: computeDir(lang) },
      setLang: () => {},
      toggleLang: () => getInitialLang(),
      t: (key: string, fallback = '') => fallback || key,
      lang: () => getInitialLang(),
    };
  }
  return ctx;
}

export { useI18nContext };
