import { useState, useEffect, useCallback, useMemo, createContext, useContext, type ReactNode } from 'react';
import type { Language, I18nState, I18nAPI } from './types';

const STORAGE_KEY = 'svu_lang';

function getInitialLang(): Language {
  try {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (stored === 'en') return 'en';
  } catch {
    // ignore storage access errors
  }
  return 'ar';
}

function applyLocale(state: { lang: Language; dir: 'ltr' | 'rtl' }) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('dir', state.dir);
  document.documentElement.setAttribute('lang', state.lang);
  document.documentElement.lang = state.lang;
  try {
    localStorage.setItem(STORAGE_KEY, state.lang);
  } catch {
    // ignore storage access errors
  }
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

const I18nContext = createContext<I18nAPI | null>(null);

export function useI18nContext(): I18nAPI {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    const lang = getInitialLang();
    const state: I18nState = { lang, dir: computeDir(lang) };
    return {
      state,
      setLang: () => {},
      toggleLang: () => state.lang,
      t: (key: string, fallback?: string) => t(key, state.lang, fallback),
    };
  }
  return ctx;
}

export function I18nProvider({ children, defaultLang }: { children: ReactNode; defaultLang?: Language }) {
  const lang = defaultLang ?? getInitialLang();
  const [state, setState] = useState<I18nState>({ lang, dir: computeDir(lang) });

  useEffect(() => {
    applyLocale(state);
  }, [state.lang]);

  const setLang = useCallback((next: Language) => {
    setState({ lang: next, dir: computeDir(next) });
  }, []);

  const toggleLang = useCallback((): Language => {
    const next: Language = state.lang === 'ar' ? 'en' : 'ar';
    setState({ lang: next, dir: computeDir(next) });
    return next;
  }, [state.lang]);

  const translate = useCallback((key: string, fallback?: string) => t(key, state.lang, fallback), [state.lang]);

  const value = useMemo<I18nAPI>(() => ({
    state,
    setLang,
    toggleLang,
    t: translate,
  }), [state, setLang, toggleLang, translate]);

  return <I18nContext.Provider value={value}>{children as React.ReactNode}</I18nContext.Provider>;
}
