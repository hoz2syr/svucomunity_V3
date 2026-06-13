/// <reference types="vite/client" />

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import type { Profile } from '@svu-community/types';

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
    resetPasswordForEmail: (email: string) => Promise<{ data: {}; error: Error | null }>;
  };
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        single: () => Promise<{ data: Profile | null; error: Error | null }>;
      };
    };
  };
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);

  const fetchProfile = useCallback(async (
    supabase: SupabaseClient,
    userId: string
  ): Promise<Profile | null> => {
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

  useEffect(() => {
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const initAuth = async () => {
      try {
        const { supabase } = await import('@svu-community/supabase-client');
        const { data: { session: currentSession } } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (currentSession) {
          setSession(currentSession);
          const profile = await fetchProfile(supabase, currentSession.user.id);
          setUser(profile ?? currentSession.user);
        } else {
          setUser(null);
          setSession(null);
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (_event: string, newSession: Session | null) => {
            if (!isMounted) return;

            setSession(newSession);

            if (newSession?.user) {
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

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const { supabase } = await import('@svu-community/supabase-client');
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      if (!data.user) throw new Error('No user returned from authentication');

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

  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { supabase } = await import('@svu-community/supabase-client');
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

  const signInWithGoogle = useCallback(async () => {
    setError(null);

    try {
      const { supabase } = await import('@svu-community/supabase-client');
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

  const register = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const { supabase } = await import('@svu-community/supabase-client');
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;

      const { data: { session: currentSession } } = await supabase.auth.getSession();

      if (currentSession) {
        setSession(currentSession);
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

  const resetPassword = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);

    try {
      const { supabase } = await import('@svu-community/supabase-client');
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

  const isAuthenticated = user !== null && session !== null;
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
