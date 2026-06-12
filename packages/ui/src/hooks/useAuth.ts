import { useState, useEffect, useCallback, useRef } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { User } from '@svu-community/types';

/**
 * Supabase client type - imported dynamically to avoid bundling issues
 */
interface SupabaseClient {
  auth: {
    getSession: () => Promise<{ data: { session: Session | null } }>;
    onAuthStateChange: (callback: (event: string, session: Session | null) => void) => {
      data: { subscription: { unsubscribe: () => void } };
    };
    signInWithPassword: (credentials: { email: string; password: string }) => Promise<{
      data: { user: User; session: Session };
      error: Error | null;
    }>;
    signInWithOAuth: (credentials: { provider: string; options: { redirectTo: string } }) => Promise<{
      data: { url: string | null };
      error: Error | null;
    }>;
    signOut: () => Promise<{ error: Error | null }>;
    signUp: (credentials: { email: string; password: string }) => Promise<{
      data: { user: User; session: Session | null };
      error: Error | null;
    }>;
    getSession: () => Promise<{ data: { session: Session | null } }>;
    resetPasswordForEmail: (email: string) => Promise<{ data: {}; error: Error | null }>;
  };
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        single: () => Promise<{ data: User | null; error: Error | null }>;
      };
    };
  };
}

/**
 * Custom React hook for managing Supabase authentication state.
 *
 * Provides authentication methods (login, logout, register, resetPassword)
 * and reactive state (user, session, loading, error).
 *
 * @returns Authentication state and control methods
 */
export function useAuth() {
  // ─── State ───────────────────────────────────────────────────────────────
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─── Refs ────────────────────────────────────────────────────────────────
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);

  /**
   * Fetches the user profile from the `users` table by user ID.
   * Falls back to the Supabase auth user if profile doesn't exist.
   * Normalizes the profile to include a `displayName` field for UI consumption.
   */
  const fetchProfile = useCallback(async (
    supabase: SupabaseClient,
    userId: string
  ): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Profile fetch failed:', error);
        return null;
      }

      if (data && !data.display_name) {
        const fullName = `${data.first_name ?? ''} ${data.last_name ?? ''}`.trim();
        const normalizedData = { ...data, display_name: fullName || data.username || data.email };
        return normalizedData;
      }

      return data;
    } catch (err) {
      console.error('Profile fetch failed:', err);
      return null;
    }
  }, []);

  /**
   * Initializes authentication state on mount.
   * Checks for an existing session and subscribes to auth state changes.
   */
  useEffect(() => {
    // Skip during SSR
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const initAuth = async () => {
      try {
        const { supabase } = await import('../../packages/supabase-client');
        const { data: { session: currentSession } } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (currentSession) {
          setSession(currentSession);

          // Fetch extended profile from users table
          const profile = await fetchProfile(supabase, currentSession.user.id);
          setUser(profile ?? currentSession.user);
        } else {
          setUser(null);
          setSession(null);
        }

        // Subscribe to auth state changes (login, logout, token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (_event, newSession) => {
            if (!isMounted) return;

            setSession(newSession);

            if (newSession?.user) {
              // Re-fetch profile on auth state change to get fresh data
              fetchProfile(supabase, newSession.user.id).then((profile) => {
                if (!isMounted) return;
                setUser(profile ?? newSession.user);
              });
            } else {
              setUser(null);
            }

            setError(null);
          }
        );

        subscriptionRef.current = subscription;
      } catch (err) {
        console.error('Auth initialization failed:', err);
        if (isMounted) {
          setError('Failed to initialize authentication');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
      subscriptionRef.current?.unsubscribe();
    };
  }, [fetchProfile]);

  /**
   * Authenticates a user with email and password.
   * @throws {Error} If authentication fails
   */
  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const { supabase } = await import('../../packages/supabase-client');
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      if (!data.user) throw new Error('No user returned from authentication');

      // Fetch extended profile from users table
      const profile = await fetchProfile(supabase, data.user.id);
      const userData = profile ?? data.user;

      setUser(userData);
      setSession(data.session);

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      if (import.meta.env.DEV) console.error('Login error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchProfile]);

  /**
   * Signs out the current user and clears auth state.
   */
  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { supabase } = await import('../../packages/supabase-client');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSession(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Logout failed';
      setError(message);
      if (import.meta.env.DEV) console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Signs in the user with Google OAuth.
   * Redirects to Google's OAuth consent screen.
   */
  const signInWithGoogle = useCallback(async () => {
    setError(null);

    try {
      const { supabase } = await import('../../packages/supabase-client');
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (oauthError) throw oauthError;
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google sign-in failed';
      setError(message);
      if (import.meta.env.DEV) console.error('Google sign-in error:', err);
      throw err;
    }
  }, []);

  /**
   * Registers a new user with email and password.
   * If email confirmation is disabled in Supabase, the user is logged in automatically.
   * @returns Registration data. If `session` is null, the user needs to confirm their email.
   * @throws {Error} If registration fails
   */
  const register = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const { supabase } = await import('../../packages/supabase-client');
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;

      // Check if the user was automatically logged in (email confirmation disabled)
      const { data: { session: currentSession } } = await supabase.auth.getSession();

      if (currentSession) {
        setSession(currentSession);

        // Fetch extended profile from users table
        const profile = await fetchProfile(supabase, currentSession.user.id);
        setUser(profile ?? currentSession.user);
      }

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
      if (import.meta.env.DEV) console.error('Registration error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchProfile]);

  /**
   * Sends a password reset email to the given address.
   */
  const resetPassword = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);

    try {
      const { supabase } = await import('../../packages/supabase-client');
      const { data, error: resetError } = await supabase.auth.resetPasswordForEmail(email);

      if (resetError) throw resetError;
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Password reset failed';
      setError(message);
      if (import.meta.env.DEV) console.error('Password reset error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Whether the user is currently authenticated with a valid session.
   */
  const isAuthenticated = user !== null && session !== null;

  /**
   * Whether the initial auth state check has completed.
   * Useful for showing loading screens during app bootstrap.
   */
  const isAuthReady = !loading;

  const setErrorState = useCallback((message: string | null) => {
    setError(message);
  }, []);

  return {
    user,
    session,
    loading,
    error,
    setError: setErrorState,
    login,
    logout,
    signInWithGoogle,
    register,
    resetPassword,
    isAuthenticated,
    isAuthReady,
  };
}
