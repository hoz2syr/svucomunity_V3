import { useEffect, useMemo, memo } from 'react';
import { AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { DeleteAccountModal, LogoutModal, SettingsModal } from '../../components/dashboard';
import { SkipLink } from '../../components/accessibility/SkipLink';
import { useAuth } from '../../contexts/AuthContext';
import { deleteOwnAccount, signOutCurrentUser } from '../../services/account.service';
import { DashboardHeader } from './DashboardHeader';
import { DashboardLayout } from './DashboardLayout';
import { EmptyDashboardState } from './EmptyDashboardState';
import { CurrentSemesterCard } from './CurrentSemesterCard';
import { Skeleton } from '../../components/ui/Skeleton';
import { useDashboardNotifications } from './useDashboardNotifications';
import { useDashboardState, type DashboardModal, type SettingsTab } from './useDashboardState';

export const DashboardPage = memo(function DashboardPage() {
  const navigate = useNavigate();
  const { session, profile, loading: authLoading } = useAuth();
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

  const user = useMemo(() => ({
    id: profile?.id || session?.user?.id || '',
    name: profile?.full_name || session?.user?.user_metadata?.full_name || 'طالب',
    username: profile?.username || session?.user?.email?.split('@')[0] || 'student',
    email: profile?.email || session?.user?.email || '',
    role: profile?.role || 'طالب',
    major: profile?.major || '',
    current_semester: profile?.current_semester || '',
  }), [session, profile]);

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

  const unreadCount = notifications.filter((n) => !n.read).length;

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
        <div className="flex flex-col h-screen w-full">
          <div className="sticky top-0 z-30 bg-[var(--color-bg-tertiary)]/75 backdrop-blur-2xl border-b border-cyan-500/10 px-5 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <Skeleton className="w-32 h-6" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="w-10 h-10 rounded-full hidden md:block" />
                <Skeleton className="w-10 h-10 rounded-full" />
                <Skeleton className="w-10 h-10 rounded-full" />
              </div>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-cyan-400 text-lg">جاري تحميل البيانات...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <SkipLink />
      <AnimatePresence>
        {activeModal === 'logout' && <LogoutModal onClose={() => closeModal(null)} onConfirm={handleSignOut} />}
        {activeModal === 'delete' && <DeleteAccountModal username={user.username} onClose={() => closeModal(null)} onConfirm={handleDeleteAccount} />}
         {activeModal === 'settings' && <SettingsModal user={user} tab={settingsTab} setTab={setSettingsTab} onClose={() => closeModal(null)} onTakeSpecializationTest={(major) => navigate(`/exam/browse?major=${encodeURIComponent(major)}`)} />}
      </AnimatePresence>
      {deleteError && (
        <div role="alert" className="fixed top-4 left-1/2 z-[60] -translate-x-1/2 w-[min(90vw,420px)] rounded-2xl bg-[var(--color-danger-light)] border border-[var(--color-danger-border)] px-4 py-3 text-sm text-[var(--color-danger-400)]">
          {deleteError}
        </div>
      )}

      <main id="main-content" className="flex-1 flex flex-col h-screen w-full overflow-hidden overflow-y-auto relative">
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
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto p-6 space-y-8">
            <section aria-label="الفصل الحالي" className="mb-8">
              <CurrentSemesterCard />
            </section>
            <section aria-label="أدوات الدراسة" className="space-y-6">
              <EmptyDashboardState userName={user.name} />
            </section>
          </div>
        </div>
      </main>

      <div className="fixed bottom-6 right-6 z-20">
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white px-4 py-2.5 rounded-full border border-white/10 backdrop-blur-md transition-all shadow-lg hover:shadow-cyan-900/20 text-sm font-medium"
        >
          <Home size={16} />
          العودة للرئيسية
        </Link>
      </div>
    </DashboardLayout>
  );
};
