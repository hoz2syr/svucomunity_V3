import { useRef, useState } from 'react';

export type DashboardModal = 'settings' | 'logout' | 'delete' | null;
export type SettingsTab = 'profile' | 'security';

export const useDashboardState = () => {
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<DashboardModal>(null);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('profile');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  return {
    profileMenuRef,
    isProfileMenuOpen,
    setIsProfileMenuOpen,
    activeModal,
    setActiveModal,
    settingsTab,
    setSettingsTab,
    isNotificationsOpen,
    setIsNotificationsOpen,
    deleteError,
    setDeleteError,
  };
};
