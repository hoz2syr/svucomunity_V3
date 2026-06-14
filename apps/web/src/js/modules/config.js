import { applyCsrfToSupabase, getCsrfToken } from './csrf.js';

const env = window.SVU_ENV || {};

function isValidSupabaseUrl(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function isValidAnonKey(key) {
  if (!key || typeof key !== 'string') return false;
  if (key.length < 20) return false;
  const parts = key.split('.');
  if (parts.length !== 3) return false;
  return true;
}

const _SUPABASE_URL = env.SUPABASE_URL || '';
const _SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY || '';

function validateConfig() {
  const errors = [];
  if (!isValidSupabaseUrl(_SUPABASE_URL)) {
    errors.push('SUPABASE_URL must be a valid HTTPS URL');
  }
  if (!isValidAnonKey(_SUPABASE_ANON_KEY)) {
    errors.push('SUPABASE_ANON_KEY is missing, too short, or not a valid JWT format');
  }
  return errors;
}

export const SUPABASE_CONFIG = {
  url: _SUPABASE_URL,
  anonKey: _SUPABASE_ANON_KEY,
};

export const APP_CONFIG = {
  name: 'SVU Community',
  version: '2.0.0',
  defaultLang: 'ar',
  supportedLangs: ['ar', 'en'],
};

export const SECURITY_CONFIG = {
  requireEmailConfirmation: true,
  sessionTimeout: 15 * 60 * 1000,
};

export const AUTH_CONFIG = Object.freeze({
  STORAGE_KEY: 'svu_session',
  SESSION_KEY: 'svu_session_token',
  USER_KEY: 'svu_user',
  SESSION_TIMEOUT: SECURITY_CONFIG.sessionTimeout,
});

export const THEME_CONFIG = Object.freeze({
  STORAGE_KEY: 'svu_theme',
  LIGHT_ATTR: 'data-theme',
  DARK_CLASS: 'dark',
});

let supabaseClient = null;
let _configError = null;

export function initSupabase() {
  if (supabaseClient) {
    return supabaseClient;
  }

  if (_configError) {
    if (import.meta.env?.DEV) {
      throw _configError;
    }
    return null;
  }

  const errors = validateConfig();
  if (errors.length > 0) {
  _configError = new Error(`Supabase configuration invalid: ${errors.join(', ')}`);
  if (import.meta.env?.DEV) {
    console.error('[Config]', _configError.message);
  }
  window.dispatchEvent(new CustomEvent('svu-config-error', {
    detail: { message: _configError.message, recoverable: false },
  }));
  return null;
  }

  try {
    if (typeof window.supabase === 'undefined') {
      const err = new Error('Supabase client library not loaded (window.supabase is undefined)');
      _configError = err;
      if (import.meta.env?.DEV) {
        console.error('[Config]', err.message);
      }
      window.dispatchEvent(new CustomEvent('svu-config-error', {
        detail: { message: err.message, recoverable: false },
      }));
      return null;
    }

    supabaseClient = window.supabase.createClient(_SUPABASE_URL, _SUPABASE_ANON_KEY, {
      global: {
        headers: {
          'Accept': 'application/json',
          'X-Client-Info': 'svu-community-web-v2',
        },
      },
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });

    applyCsrfToSupabase(supabaseClient);

    return supabaseClient;
  } catch (e) {
    _configError = e instanceof Error ? e : new Error(String(e));
    if (import.meta.env?.DEV) {
      console.error('[Config] Supabase init error:', _configError.message);
    }
    window.dispatchEvent(new CustomEvent('svu-config-error', {
      detail: { message: _configError.message, recoverable: true },
    }));
    return null;
  }
}

export async function getDb() {
  return initSupabase();
}

export function isSupabaseConfigured() {
  return !_configError && !!(_SUPABASE_URL && _SUPABASE_ANON_KEY);
}

export function getConfigError() {
  return _configError;
}

export async function getSessionFromDb() {
  const db = initSupabase();
  if (!db) return null;
  try {
    const { data: { session } } = await db.auth.getSession();
    return session;
  } catch (err) {
    if (import.meta.env?.DEV) {
      console.warn('[config] getSessionFromDb failed:', err);
    }
    return null;
  }
}

export async function verifySessionWithServer(db) {
  if (!db) db = initSupabase();
  if (!db) return false;

  try {
    const { data: { user } } = await db.auth.getUser();
    return !!user;
  } catch {
    return false;
  }
}
