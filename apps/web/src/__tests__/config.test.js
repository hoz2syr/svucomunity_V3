import { describe, expect, it } from 'vitest';
import {
  SUPABASE_CONFIG, APP_CONFIG, SECURITY_CONFIG,
  AUTH_CONFIG, THEME_CONFIG, isSupabaseConfigured,
} from '../../js/modules/config.js';

describe('config', () => {
  it('exports SUPABASE_CONFIG with url and anonKey', () => {
    expect(SUPABASE_CONFIG).toHaveProperty('url');
    expect(SUPABASE_CONFIG).toHaveProperty('anonKey');
  });

  it('APP_CONFIG has correct defaults', () => {
    expect(APP_CONFIG.name).toBe('SVU Community');
    expect(APP_CONFIG.version).toBe('2.0.0');
    expect(APP_CONFIG.defaultLang).toBe('ar');
    expect(APP_CONFIG.supportedLangs).toEqual(['ar', 'en']);
  });

  it('SECURITY_CONFIG has expected sessionTimeout and email confirmation', () => {
    expect(SECURITY_CONFIG.sessionTimeout).toBe(15 * 60 * 1000);
    expect(SECURITY_CONFIG.requireEmailConfirmation).toBe(true);
  });

  it('AUTH_CONFIG and THEME_CONFIG expose correct keys', () => {
    expect(AUTH_CONFIG.STORAGE_KEY).toBe('svu_session');
    expect(THEME_CONFIG.STORAGE_KEY).toBe('svu_theme');
    expect(THEME_CONFIG.DARK_CLASS).toBe('dark');
    expect(typeof isSupabaseConfigured()).toBe('boolean');
  });

  it('isSupabaseConfigured returns false for http:// URL', () => {
    expect(isSupabaseConfigured()).toBe(false);
  });

  it('isSupabaseConfigured returns false when anonKey is missing', () => {
    expect(isSupabaseConfigured()).toBe(false);
  });

  it('AUTH_CONFIG and THEME_CONFIG are frozen', () => {
    expect(Object.isFrozen(AUTH_CONFIG)).toBe(true);
    expect(Object.isFrozen(THEME_CONFIG)).toBe(true);
  });
});
