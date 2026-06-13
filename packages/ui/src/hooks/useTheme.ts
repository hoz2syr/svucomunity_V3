import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'svu_theme';
const ATTRIBUTE = 'data-theme';

let setThemeRef: React.Dispatch<React.SetStateAction<Theme>> | null = null;

function resolveSystemTheme(): 'light' | 'dark' {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'dark';
}

function readStoredTheme(): Theme {
  if (typeof localStorage === 'undefined') return 'dark';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  return 'dark';
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => readStoredTheme());
  setThemeRef = setTheme;

  useEffect(() => {
    const resolved = theme === 'system' ? resolveSystemTheme() : theme;
    applyResolvedTheme(resolved);
  }, [theme]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (theme === 'system') applyResolvedTheme(resolveSystemTheme());
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      if (prev === 'dark') return 'light';
      if (prev === 'light') return 'system';
      return 'dark';
    });
  }, []);

  const setLight = useCallback(() => setTheme('light'), []);
  const setDark = useCallback(() => setTheme('dark'), []);
  const setSystem = useCallback(() => setTheme('system'), []);

  return { theme, toggleTheme, setLight, setDark, setSystem };
}

export function toggleTheme() {
  setThemeRef?.((prev: Theme) => {
    if (prev === 'dark') return 'light';
    if (prev === 'light') return 'system';
    return 'dark';
  });
}

export function applyTheme(next: 'light' | 'dark' | 'system'): void {
  if (typeof document === 'undefined') return;
  const resolved = next === 'system' ? resolveSystemTheme() : next;
  applyResolvedTheme(resolved);
  localStorage.setItem(STORAGE_KEY, next);
}

function applyResolvedTheme(resolved: 'light' | 'dark'): void {
  document.documentElement.setAttribute(ATTRIBUTE, resolved);
}

export function getStoredTheme(): 'light' | 'dark' | 'system' {
  return readStoredTheme();
}
