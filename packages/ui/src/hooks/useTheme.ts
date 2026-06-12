import { useState, useEffect, useCallback } from 'react';

export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const stored = localStorage.getItem('svu_theme') as 'light' | 'dark' | null;
    if (stored) setTheme(stored);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('svu_theme', next);
      return next;
    });
  }, []);

  return { theme, toggleTheme };
}
