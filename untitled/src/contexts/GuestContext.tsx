import { createContext, useContext, useEffect, useState } from 'react';

interface GuestState {
  isGuest: boolean;
  enableGuestMode: () => void;
  disableGuestMode: () => void;
}

const GuestContext = createContext<GuestState | undefined>(undefined);

const GUEST_MODE_KEY = 'svu-guest-mode';

export const GuestProvider = ({ children }: { children: React.ReactNode }) => {
  const [isGuest, setIsGuest] = useState<boolean>(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(GUEST_MODE_KEY);
    if (stored === 'true') {
      setIsGuest(true);
    }
  }, []);

  const enableGuestMode = () => {
    sessionStorage.setItem(GUEST_MODE_KEY, 'true');
    setIsGuest(true);
  };

  const disableGuestMode = () => {
    sessionStorage.removeItem(GUEST_MODE_KEY);
    setIsGuest(false);
  };

  return (
    <GuestContext.Provider value={{ isGuest, enableGuestMode, disableGuestMode }}>
      {children}
    </GuestContext.Provider>
  );
};

export const useGuest = () => {
  const ctx = useContext(GuestContext);
  if (!ctx) throw new Error('useGuest must be used within GuestProvider');
  return ctx;
};
