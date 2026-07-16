import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { hasSupabaseEnv } from '@/src/lib/supabase';
import { listenAuthChanges } from '@/src/services/auth.service';

interface GuestProfile {
  name: string;
  email: string;
}

interface GuestState {
  isGuest: boolean;
  guestProfile: GuestProfile | null;
  enableGuestMode: (profile?: GuestProfile) => void;
  disableGuestMode: () => void;
}

const GuestContext = createContext<GuestState | undefined>(undefined);
export { GuestContext };

const GUEST_MODE_KEY = 'svu-guest-mode';
const GUEST_PROFILE_KEY = 'svu-guest-profile';

// Guest mode allows browsing without authentication.
// Guest data is stored in sessionStorage as plain text and treated as untrusted.
// We intentionally avoid encryption to keep the client simple; sensitive operations must still go through auth.

// Runtime guard that validates the shape of parsed guest profile data.
const isGuestProfile = (value: unknown): value is GuestProfile => {
  return typeof value === 'object' && value !== null && typeof (value as Record<string, unknown>).name === 'string' && typeof (value as Record<string, unknown>).email === 'string';
};

const readGuestProfile = (): GuestProfile | null => {
  try {
    const raw = sessionStorage.getItem(GUEST_PROFILE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (isGuestProfile(parsed)) {
      return parsed;
    }
    return null;
  } catch (error) {
    console.warn('Failed to read guest profile from sessionStorage', error);
    return null;
  }
};

const saveGuestProfile = (profile: GuestProfile): void => {
  sessionStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify(profile));
};

export const GuestProvider = ({ children }: { children: React.ReactNode }) => {
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [guestProfile, setGuestProfile] = useState<GuestProfile | null>(null);
  const isGuestRef = useRef(isGuest);

  // Keep ref in sync with state so the auth listener callback always sees the latest value.
  useEffect(() => {
    isGuestRef.current = isGuest;
  }, [isGuest]);

  const enableGuestMode = useCallback((profile?: GuestProfile) => {
    sessionStorage.setItem(GUEST_MODE_KEY, 'true');
    setIsGuest(true);
    const defaultProfile: GuestProfile = {
      name: profile?.name || 'زائر',
      email: profile?.email || `guest-${Date.now()}@local`,
    };
    saveGuestProfile(defaultProfile);
    setGuestProfile(defaultProfile);
  }, []);

  const disableGuestMode = useCallback(() => {
    sessionStorage.removeItem(GUEST_MODE_KEY);
    sessionStorage.removeItem(GUEST_PROFILE_KEY);
    setIsGuest(false);
    setGuestProfile(null);
  }, []);

  // Restore guest mode from sessionStorage on initial load.
  useEffect(() => {
    const stored = sessionStorage.getItem(GUEST_MODE_KEY);
    if (stored === 'true') {
      setIsGuest(true);
      setGuestProfile(readGuestProfile());
    }
  }, []);

  // Listen for auth changes; if a real session appears while in guest mode, exit guest mode.
  // The mounted flag prevents state updates after unmount.
  useEffect(() => {
    if (!hasSupabaseEnv()) return;

    let mounted = true;
    let subscription: { unsubscribe: () => void } | null = null;

    const setupListener = async () => {
      try {
        const listener = await listenAuthChanges((session) => {
          if (!mounted) return;
          if (session && isGuestRef.current) {
            disableGuestMode();
          }
        });
        if (mounted) {
          subscription = listener;
        } else {
          listener.unsubscribe();
        }
      } catch (error) {
        console.warn('Failed to setup auth listener', error);
      }
    };

    setupListener();

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [disableGuestMode]);

  return (
    <GuestContext.Provider value={{ isGuest, guestProfile, enableGuestMode, disableGuestMode }}>
      {children}
    </GuestContext.Provider>
  );
};

export const useGuest = () => {
  const ctx = useContext(GuestContext);
  if (!ctx) throw new Error('useGuest must be used within GuestProvider');
  return ctx;
};
