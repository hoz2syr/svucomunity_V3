import { useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { DeleteAccountModal, LogoutModal, SettingsModal } from '../../components/dashboard';
import { useAuth } from '../../contexts/AuthContext';
import { useGuest } from '../../contexts/GuestContext';
import { deleteOwnAccount, signOutCurrentUser } from '../../services/account.service';
import { DashboardHeader } from './DashboardHeader';
import { DashboardLayout } from './DashboardLayout';
import { EmptyDashboardState } from './EmptyDashboardState';
import { useDashboardNotifications } from './useDashboardNotifications';
import { useDashboardState, type DashboardModal, type SettingsTab } from './useDashboardState';

const getUser = (session: ReturnType<typeof useAuth>['session'], profile: ReturnType<typeof useAuth>['profile']) => ({
  id: profile?.id || session?.user?.id || '',
  name: profile?.full_name || session?.user?.user_metadata?.full_name || 'طالب',
  username: profile?.username || session?.user?.email?.split('@')[0] || 'student',
  email: profile?.email || session?.user?.email || '',
  role: profile?.role || 'طالب',
});

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { session, profile, loading: authLoading } = useAuth();
  const { isGuest, enableGuestMode } = useGuest();
  const {
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
  } = useDashboardState();

  const {
    notifications,
    notificationsLoading,
    notificationsError,
  } = useDashboardNotifications();

  useEffect(() => {
    if (!isProfileMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileMenuOpen, setIsProfileMenuOpen, profileMenuRef]);

  const user = getUser(session, profile);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleGuestLoginPrompt = () => {
    enableGuestMode();
    navigate('/login', { replace: true });
  };

  const handleSignOut = async () => {
    const result = await signOutCurrentUser();
    if (result.ok) {
      navigate('/', { replace: true });
      return;
    }
    navigate('/login', { replace: true });
  };

  const handleDeleteAccount = async () => {
    const result = await deleteOwnAccount();
    if (result.ok) {
      navigate('/', { replace: true });
    } else {
      setDeleteError(result.error || 'فشل حذف الحساب');
    }
  };

  const openSettings = (tab: SettingsTab) => {
    setSettingsTab(tab);
    setActiveModal('settings');
    setIsProfileMenuOpen(false);
  };

  const closeModal = (modal: DashboardModal) => {
    setActiveModal(modal);
    if (modal === 'delete') setDeleteError(null);
  };

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center flex-1">
          <div className="text-cyan-400 text-lg">جاري تحميل البيانات...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <AnimatePresence>
        {activeModal === 'logout' && <LogoutModal onClose={() => closeModal(null)} onConfirm={handleSignOut} />}
        {activeModal === 'delete' && <DeleteAccountModal username={user.username} onClose={() => closeModal(null)} onConfirm={handleDeleteAccount} />}
        {activeModal === 'settings' && <SettingsModal user={user} tab={settingsTab} setTab={setSettingsTab} onClose={() => closeModal(null)} />}
      </AnimatePresence>
      {deleteError && (
        <div role="alert" className="fixed top-4 left-1/2 z-[60] -translate-x-1/2 w-[min(90vw,420px)] rounded-2xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-200">
          {deleteError}
        </div>
      )}

      <main className="flex-1 flex flex-col h-screen w-full overflow-hidden overflow-y-auto relative">
        <DashboardHeader
          user={user}
          isNotificationsOpen={isNotificationsOpen}
          unreadCount={unreadCount}
          notificationsLoading={notificationsLoading}
          notificationsError={notificationsError}
          notifications={notifications}
          isProfileMenuOpen={isProfileMenuOpen}
          onToggleNotifications={() => setIsNotificationsOpen((prev) => !prev)}
          onToggleProfile={() => setIsProfileMenuOpen((prev) => !prev)}
          onOpenSettings={openSettings}
          onOpenLogout={() => {
            setIsProfileMenuOpen(false);
            setActiveModal('logout');
          }}
          onOpenDelete={() => {
            setIsProfileMenuOpen(false);
            setActiveModal('delete');
          }}
        />
        <EmptyDashboardState userName={user.name} />
      </main>

      <div className="fixed bottom-4 right-4 text-slate-600 text-xs">
        <Link to="/" className="hover:text-cyan-400 transition-colors">العودة للرئيسية</Link>
      </div>
    </DashboardLayout>
  );
};
