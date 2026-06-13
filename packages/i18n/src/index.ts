import { useState, useEffect, useCallback, createContext, useContext, useMemo, type ReactNode } from 'react';
import type { Language, I18nState, I18nAPI } from './types';

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

const I18nContext = createContext<I18nAPI | null>(null);

function useI18nContext(): I18nAPI {
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

export { useI18nContext };

export function I18nProvider({ children, defaultLang }: { children: ReactNode; defaultLang?: Language }) {
  const lang = defaultLang ?? getInitialLang();
  const [state, setState] = useState<I18nState>({ lang, dir: computeDir(lang) });

  useEffect(() => {
    applyLocale(state);
  }, [state.lang]);

  const setLang = useCallback((next: Language) => {
    setState({ lang: next, dir: computeDir(next) });
  }, []);

  const toggleLang = useCallback(() => {
    setState((cur) => ({ lang: (cur.lang === 'ar' ? 'en' : 'ar') as Language, dir: computeDir((cur.lang === 'ar' ? 'en' : 'ar') as Language) }));
  }, []);

  const translate = useCallback((key: string, fallback?: string) => t(key, state.lang, fallback), [state.lang]);

  const value = useMemo<I18nAPI>(() => ({
    state,
    setLang,
    toggleLang,
    t: translate,
  }), [state, setLang, toggleLang, translate]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export { I18nProvider };
