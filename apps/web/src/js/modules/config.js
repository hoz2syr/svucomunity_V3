/**
 * SVU Community — App configuration and Supabase client bootstrap
 */

const env = window.SVU_ENV || {};
const SUPABASE_URL = env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY || '';

export const SUPABASE_CONFIG = {
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY,
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

// ════════════════════════════════════════════════════════════════
// Auth / Theme config (used by core.js)
// ════════════════════════════════════════════════════════════════

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

// ════════════════════════════════════════════════════════════════
// Supabase bootstrap
// ════════════════════════════════════════════════════════════════

import { applyCsrfToSupabase, getCsrfToken } from './csrf.js';

let supabaseClient = null;

export function initSupabase() {
  if (supabaseClient) {
    applyCsrfToSupabase(supabaseClient);
    return supabaseClient;
  }

  try {
    if (typeof window.supabase === 'undefined' || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return null;
    }

    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: {
          'Accept': 'application/json',
          'X-Client-Info': 'svu-community-web-v2',
          'X-CSRF-Token': getCsrfToken(),
        },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });

    applyCsrfToSupabase(supabaseClient);

    return supabaseClient;
  } catch (e) {
    console.warn('[Config] Supabase init error:', e instanceof Error ? e.message : String(e));
    return null;
  }
}

export async function getDb() {
  return initSupabase();
}

export function isSupabaseConfigured() {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL.startsWith('https://'));
}

export async function getSessionFromDb() {
  const db = initSupabase();
  if (!db) return null;
  try {
    const { data: { session } } = await db.auth.getSession();
    return session;
  } catch (err) {
    console.warn('[config] getSessionFromDb failed:', err);
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
