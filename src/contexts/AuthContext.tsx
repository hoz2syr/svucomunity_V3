import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { Session } from '@supabase/supabase-js';
import { hasSupabaseEnv, refreshCurrentSession, getErrorMessage } from '../lib/supabase';
import { completeAuthCallback, listenAuthChanges } from '../services/auth.service';
import { refreshProfile as refreshProfileService } from '../services/profile.service';
import type { Profile } from '../types/profile';

const SESSION_EXPIRY_WARNING_MS = 5 * 60 * 1000;

const decodeJwt = (token: string): { exp: number } | null => {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch {
    return null;
  }
};

interface AuthState {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  envMissing: boolean;
  error: string | null;
  sessionExpiring: boolean;
  sessionExpiryTime: number | null;
}

interface AuthContextValue extends AuthState {
  refreshProfile: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<AuthState['session']>(null);
  const [profile, setProfile] = useState<AuthState['profile']>(null);
  const [loading, setLoading] = useState(true);
  const [envMissing, setEnvMissing] = useState(!hasSupabaseEnv());
  const [error, setError] = useState<string | null>(null);
  const [sessionExpiring, setSessionExpiring] = useState(false);
  const [sessionExpiryTime, setSessionExpiryTime] = useState<number | null>(null);
  const refreshingRef = useRef(false);

  const refreshProfileForUser = useCallback(async (userId: string) => {
    if (!hasSupabaseEnv()) {
      setProfile(null);
      return;
    }

    try {
      const profileResult = await refreshProfileService(userId);
      if (profileResult.error || !profileResult.data) {
        if (profileResult.error) console.error('refreshProfile profile error:', profileResult.error);
        setProfile(null);
        return;
      }
      setProfile(profileResult.data);
    } catch (error) {
      console.error('refreshProfile exception:', getErrorMessage(error));
      setProfile(null);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (session?.user?.id) {
      await refreshProfileForUser(session.user.id);
    }
  }, [refreshProfileForUser, session]);

  const initializedUserIdRef = useRef<string | null>(null);

  const checkSessionExpiry = useCallback(() => {
    if (!session?.access_token) {
      setSessionExpiring(false);
      setSessionExpiryTime(null);
      return;
    }

    const payload = decodeJwt(session.access_token);
    if (!payload?.exp) return;

    const now = Math.floor(Date.now() / 1000);
    const remainingMs = (payload.exp - now) * 1000;
    const warningThreshold = SESSION_EXPIRY_WARNING_MS;

    setSessionExpiryTime(payload.exp * 1000);
    setSessionExpiring(remainingMs <= warningThreshold && remainingMs > 0);
  }, [session]);

  useEffect(() => {
    checkSessionExpiry();
    if (!session?.access_token) return;

    const interval = setInterval(checkSessionExpiry, 30_000);
    return () => clearInterval(interval);
  }, [session, checkSessionExpiry]);

  useEffect(() => {
    if (!sessionExpiring || !session?.access_token || refreshingRef.current) return;

    refreshingRef.current = true;

    const timer = setTimeout(async () => {
      try {
        const refreshed = await refreshCurrentSession();
        if (!refreshed) {
          setSession(null);
        }
      } catch {
        setSession(null);
      } finally {
        refreshingRef.current = false;
      }
    }, 0);

    return () => {
      clearTimeout(timer);
      refreshingRef.current = false;
    };
  }, [sessionExpiring, session]);

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    if (!hasSupabaseEnv()) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const init = async () => {
      try {
        const result = await completeAuthCallback();
        if (!mounted) return;
        setEnvMissing(false);

        if (result.error) {
          setError(result.error.message);
          setSession(null);
          setProfile(null);
          initializedUserIdRef.current = null;
        } else {
          setError(null);
          setSession(result.data.session);
          if (result.data.session?.user?.id) {
            initializedUserIdRef.current = result.data.session.user.id;
            await refreshProfileForUser(result.data.session.user.id);
          }
        }
      } catch (error) {
        if (mounted) {
          setEnvMissing(true);
          setError(getErrorMessage(error));
          console.error('Auth init error:', getErrorMessage(error));
          setSession(null);
          setProfile(null);
          initializedUserIdRef.current = null;
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, [refreshProfileForUser]);

  useEffect(() => {
    if (!hasSupabaseEnv()) {
      return;
    }

    let mounted = true;
    let subscription: { unsubscribe: () => void } | null = null;

    const timer = setTimeout(async () => {
      try {
        const listener = await listenAuthChanges(async (session) => {
          if (!mounted) return;
          setEnvMissing(false);
          setSession(session);
          if (session?.user?.id) {
            await refreshProfileForUser(session.user.id);
          } else {
            setProfile(null);
          }
          setLoading(false);
        });
        if (mounted) {
          subscription = listener;
        }
      } catch (error) {
        if (mounted) {
          setEnvMissing(true);
          console.error('Auth subscription error:', getErrorMessage(error));
        }
      }
    }, 0);

    return () => {
      mounted = false;
      clearTimeout(timer);
      subscription?.unsubscribe();
    };
  }, [refreshProfileForUser]);

  return (
    <AuthContext.Provider value={{ session, profile, loading, refreshProfile, envMissing, error, clearError, sessionExpiring, sessionExpiryTime }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
