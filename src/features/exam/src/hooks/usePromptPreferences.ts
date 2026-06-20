"use client";

import { useState, useEffect, useCallback } from 'react';

export interface PromptPreferences {
  topic: string;
  difficulty: string;
  mcqCount: number;
  tfCount: number;
  essayCount: number;
  includeExplanations: boolean;
}

const DEFAULTS: PromptPreferences = {
  topic: 'البنى الجبرية',
  difficulty: 'متوسط',
  mcqCount: 10,
  tfCount: 5,
  essayCount: 0,
  includeExplanations: true,
};

const STORAGE_KEY = 'svu_prompt_settings';

export function usePromptPreferences() {
  const [prefs, setPrefs] = useState<PromptPreferences>(DEFAULTS);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setPrefs({ ...DEFAULTS, ...parsed });
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  const save = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch {
      // ignore storage errors
    }
  }, [prefs]);

  const update = useCallback(<K extends keyof PromptPreferences>(key: K, value: PromptPreferences[K]) => {
    setPrefs(prev => ({ ...prev, [key]: value }));
  }, []);

  return { prefs, update, save, isSaved };
}
