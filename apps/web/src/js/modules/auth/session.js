/**
 * SVU Community — Session helpers
 *
 * IMPORTANT: This module no longer stores tokens in localStorage.
 * Session persistence is handled by the Supabase JS SDK through
 * its built-in auth state management (Memory + Session storage).
 *
 * For true httpOnly + Secure + SameSite cookie sessions with SSR,
 * move auth flows to a server-side adapter (e.g. Next.js, Express,
 * or Supabase SSR middleware) using `@supabase/ssr`. Until then,
 * this module provides only Supabase-backed session helpers.
 */

import { initSupabase } from '../config.js';
import { clearUserSession } from '../core.js';

function getSupabase() {
  return initSupabase();
}

export async function getSession() {
  const supabase = getSupabase();
  if (!supabase) {
    console.error('[session] getSession failed: Supabase not initialized');
    return null;
  }
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error('[session] getSession failed:', error);
    return null;
  }
  return data.session ?? null;
}

export async function setSession(refreshToken) {
  if (!refreshToken || typeof refreshToken !== 'string' || refreshToken.length < 50) {
    throw new Error('Invalid refresh token');
  }

  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase not initialized');
  }

  const { data, error } = await supabase.auth.setSession({
    refresh_token: refreshToken,
  });

  if (error) {
    console.error('[session] setSession failed:', error);
    throw new Error('Unable to restore session');
  }
  return data.session;
}

export async function clearSession() {
  const supabase = getSupabase();

  try {
    await supabase.auth.signOut();
  } catch {
    // ignore sign-out errors
  }

  try {
    sessionStorage.removeItem('svu_csrf_token');
    sessionStorage.removeItem('svu_theme');
    localStorage.removeItem('svu_user');
  } catch {
    // ignore storage errors
  }
}
