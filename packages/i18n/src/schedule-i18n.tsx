import { useState, useEffect, useCallback, createContext, useContext, useMemo } from 'react';
import type { Language, I18nContextValue, TranslationDictionary } from './types';
import { scheduleTranslations } from './schedule';

const STORAGE_KEY = 'svu_lang';

function getInitialLang(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'ar' || stored === 'en') return stored;
  } catch {
    // ignore storage errors
  }
  return 'ar';
}

function flattenTranslations(dict: TranslationDictionary, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(dict)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') {
      result[fullKey] = value;
    } else if (value && typeof value === 'object') {
      Object.assign(result, flattenTranslations(value, fullKey));
    }
  }
  return result;
}

const SCHEDULE_AR = flattenTranslations(scheduleTranslations.ar);
const SCHEDULE_EN = flattenTranslations(scheduleTranslations.en);

export function t(key: string, fallback = ''): string {
  const lang = (typeof window !== 'undefined' ? document.documentElement.getAttribute('data-lang') : null) || 'ar';
  const dict = lang === 'en' ? SCHEDULE_EN : SCHEDULE_AR;
  return dict[key] ?? fallback ?? key;
}

export function setLang(lang: Language, dir: 'rtl' | 'ltr' = lang === 'ar' ? 'rtl' : 'ltr'): void {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // ignore storage errors
  }
  if (typeof window !== 'undefined') {
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('data-lang', lang);
  }
}

export function getLang(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'ar' || stored === 'en') return stored;
  } catch {
    // ignore storage errors
  }
  return 'ar';
}

export function toggleLang(): Language {
  const next: Language = getLang() === 'ar' ? 'en' : 'ar';
  setLang(next);
  return next;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children, defaultLang }: { children: React.ReactNode; defaultLang?: Language }) {
  const [lang, setLangState] = useState<Language>(() => defaultLang ?? getInitialLang());

  useEffect(() => {
    setLang(lang, lang === 'ar' ? 'rtl' : 'ltr');
  }, [lang]);

  const tKey = useCallback((key: string, fallback?: string) => {
    const dict = lang === 'en' ? SCHEDULE_EN : SCHEDULE_AR;
    return dict[key] ?? fallback ?? key;
  }, [lang]);

  const toggle = useCallback(() => {
    setLangState((prev) => (prev === 'ar' ? 'en' : 'ar') as Language);
  }, []);

  const value = useMemo<I18nContextValue>(() => ({
    lang,
    setLang: setLangState,
    toggleLang: toggle,
    t: tKey,
    dir: lang === 'ar' ? 'rtl' : 'ltr',
    isRTL: lang === 'ar',
  }), [lang, tKey, toggle]);

  return <I18nContext.Provider value={value}>{children as React.ReactNode}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within <I18nProvider>');
  return ctx;
}
