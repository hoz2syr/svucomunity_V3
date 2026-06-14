import { useState, useEffect, useCallback, createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { Language, I18nState, I18nAPI } from './types';
import { useI18nContext, I18nProvider } from './core';

const STORAGE_KEY = 'svu_lang';

function getInitialLang(): Language {
  try {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (stored === 'en') return 'en';
  } catch {}
  return 'ar';
}

function applyLocale(state: { lang: Language; dir: 'ltr' | 'rtl' }) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('dir', state.dir);
  document.documentElement.setAttribute('lang', state.lang);
  document.documentElement.lang = state.lang;
  try {
    localStorage.setItem(STORAGE_KEY, state.lang);
  } catch {}
}

function computeDir(lang: Language): 'ltr' | 'rtl' {
  return lang === 'ar' ? 'rtl' : 'ltr';
}

type Dicts = {
  schedule: Record<'ar' | 'en', Record<string, string>>;
};

const DICTS: Dicts = {
  schedule: {
    ar: {},
    en: {},
  },
};

export function pickDict(dicts: Dicts['schedule'], lang: Language) {
  return dicts[lang] ?? dicts.ar;
}

export function t(key: string, lang: Language, fallback?: string) {
  return pickDict(DICTS.schedule, lang)[key] ?? fallback ?? key;
}

export { useI18nContext, I18nProvider };
