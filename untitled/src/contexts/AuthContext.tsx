import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import { hasSupabaseEnv, getErrorMessage } from '../services/environment.service';
import { completeAuthCallback, listenAuthChanges } from '../services/auth.service';
import { refreshProfile as refreshProfileService } from '../services/profile.service';
import type { Profile } from '../types/profile';

interface AuthState {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  envMissing: boolean;
}

interface AuthContextValue extends AuthState {
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<AuthState['session']>(null);
  const [profile, setProfile] = useState<AuthState['profile']>(null);
  const [loading, setLoading] = useState(true);
  const [envMissing, setEnvMissing] = useState(!hasSupabaseEnv());

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
    if (session?.user) {
      await refreshProfileForUser(session.user.id);
    }
  }, [refreshProfileForUser, session]);

  useEffect(() => {
    if (!hasSupabaseEnv()) {
      setLoading(false);
      return;
    }

    let mounted = true;
    let subscription: { unsubscribe: () => void } | null = null;

    const init = async () => {
      try {
        const result = await completeAuthCallback();
        if (!mounted) return;
        setEnvMissing(false);
        setSession(result.data.session);
        if (result.data.session) {
          await refreshProfileForUser(result.data.session.user.id);
        }
      } catch (error) {
        if (mounted) {
          setEnvMissing(true);
          console.error('Auth init error:', getErrorMessage(error));
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    const setupListener = async () => {
      try {
        const listener = await listenAuthChanges(async (session) => {
          if (!mounted) return;
          setEnvMissing(false);
          setSession(session);
          if (session?.user) {
              await refreshProfileForUser(session.user.id);
          } else {
            setProfile(null);
          }
          setLoading(false);
        });
        subscription = listener;
      } catch (error) {
        if (mounted) {
          setEnvMissing(true);
          console.error('Auth subscription error:', getErrorMessage(error));
        }
      }
    };

    setupListener();

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [refreshProfileForUser]);

  return (
    <AuthContext.Provider value={{ session, profile, loading, refreshProfile, envMissing }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
