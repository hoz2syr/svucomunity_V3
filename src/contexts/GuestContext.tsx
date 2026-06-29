import { createContext, useContext, useEffect, useState, useRef } from 'react';
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

const ENCRYPTION_KEY = 'svu-community-guest-v3-2026';

const toUint8Array = (str: string): Uint8Array => new TextEncoder().encode(str);

const fromUint8Array = (arr: Uint8Array): string => new TextDecoder().decode(arr);

const uint8ToBase64 = (arr: Uint8Array): string => {
  let binary = '';
  for (let i = 0; i < arr.length; i++) {
    binary += String.fromCharCode(arr[i]);
  }
  return btoa(binary);
};

const base64ToUint8 = (b64: string): Uint8Array => {
  const binary = atob(b64);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    arr[i] = binary.charCodeAt(i);
  }
  return arr;
};

const encrypt = (data: string): string => {
  const keyBytes = toUint8Array(ENCRYPTION_KEY);
  const dataBytes = toUint8Array(data);
  const result = new Uint8Array(dataBytes.length);
  for (let i = 0; i < dataBytes.length; i++) {
    result[i] = dataBytes[i] ^ keyBytes[i % keyBytes.length];
  }
  return uint8ToBase64(result);
};

const decrypt = (encoded: string): string => {
  const keyBytes = toUint8Array(ENCRYPTION_KEY);
  const dataBytes = base64ToUint8(encoded);
  const result = new Uint8Array(dataBytes.length);
  for (let i = 0; i < dataBytes.length; i++) {
    result[i] = dataBytes[i] ^ keyBytes[i % keyBytes.length];
  }
  return fromUint8Array(result);
};

const readGuestProfile = (): GuestProfile | null => {
  try {
    const raw = sessionStorage.getItem(GUEST_PROFILE_KEY);
    if (!raw) return null;
    const decrypted = decrypt(raw);
    return JSON.parse(decrypted) as GuestProfile;
  } catch {
    return null;
  }
};

const saveGuestProfile = (profile: GuestProfile): void => {
  const encrypted = encrypt(JSON.stringify(profile));
  sessionStorage.setItem(GUEST_PROFILE_KEY, encrypted);
};

export const GuestProvider = ({ children }: { children: React.ReactNode }) => {
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [guestProfile, setGuestProfile] = useState<GuestProfile | null>(null);
  const isGuestRef = useRef(isGuest);
  isGuestRef.current = isGuest;

  const enableGuestMode = (profile?: GuestProfile) => {
    sessionStorage.setItem(GUEST_MODE_KEY, 'true');
    setIsGuest(true);
    const defaultProfile: GuestProfile = {
      name: profile?.name || 'زائر',
      email: profile?.email || `guest-${Date.now()}@local`,
    };
    saveGuestProfile(defaultProfile);
    setGuestProfile(defaultProfile);
  };

  const disableGuestMode = () => {
    sessionStorage.removeItem(GUEST_MODE_KEY);
    sessionStorage.removeItem(GUEST_PROFILE_KEY);
    setIsGuest(false);
    setGuestProfile(null);
  };

  useEffect(() => {
    const stored = sessionStorage.getItem(GUEST_MODE_KEY);
    if (stored === 'true') {
      setIsGuest(true);
      setGuestProfile(readGuestProfile());
    }
  }, []);

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
      } catch {
        // Silently fail - auth state changes are best-effort
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
