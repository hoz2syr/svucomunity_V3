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

import { supabase } from '@svu-community/supabase-client';

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error('[session] getSession failed:', error);
    return null;
  }
  return data.session ?? null;
}

export async function setSession(refreshToken) {
  if (!refreshToken || typeof refreshToken !== 'string') {
    throw new Error('Invalid refresh token');
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
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('[session] signOut failed:', error);
    throw new Error('Unable to sign out');
  }
}
