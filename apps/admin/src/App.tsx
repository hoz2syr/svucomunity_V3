import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from './shared/layout/AdminLayout';
import { Sidebar } from './shared/components/Sidebar';
import { useTheme } from '@svu-community/ui';
import DashboardPage from './features/dashboard/DashboardPage';
import UsersPage from './features/users/UsersPage';
import CoursesPage from './features/courses/CoursesPage';
import GroupsPage from './features/groups/GroupsPage';
import SettingsPage from './features/settings/SettingsPage';
import { useRoute, registerRoute } from './shared/routing';
import { supabase, isAdmin } from '@svu-community/supabase-client';
import type { User } from '@svu-community/types';

type Profile = {
  is_admin: boolean;
  is_active: boolean;
  email_confirmed_at: string | null;
};

registerRoute('/dashboard', DashboardPage);
registerRoute('/users', UsersPage);
registerRoute('/courses', CoursesPage);
registerRoute('/settings', SettingsPage);

function App() {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { theme, setLight, setDark, setSystem } = useTheme();
  const { isActive, navigate } = useRoute();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const validateAccess = useCallback(async (user: User | null) => {
    if (!user?.id) {
      setIsAuthorized(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('is_admin, is_active, email_confirmed_at')
        .eq('id', user.id)
        .maybeSingle<Profile>();

      if (error || !profile) {
        setIsAuthorized(false);
        return;
      }

      const authorized = isAdmin(profile as unknown as User) && !!profile.is_active && !!profile.email_confirmed_at;
      setIsAuthorized(authorized);
    } catch {
      setIsAuthorized(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const initAuth = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user as User | null;
      if (cancelled) return;
      await validateAccess(user);
    };

    void initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (cancelled) return;
      const user = (session?.user ?? null) as User | null;
      await validateAccess(user);
    });

    const onFocus = () => {
      if (cancelled || isAuthorized !== true) return;
      supabase.auth.getUser().then(({ data }) => {
        if (cancelled) return;
        validateAccess(data.user as User | null);
      });
    };

    window.addEventListener('focus', onFocus);

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      window.removeEventListener('focus', onFocus);
    };
  }, [validateAccess, isAuthorized]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-secondary-400">جاري التحميل...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="glass rounded-2xl p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-white mb-4">غير مصرح لك بالوصول</h1>
          <p className="text-secondary-400">ليس لديك صلاحيات إدارة للوصول إلى هذه الصفحة.</p>
        </div>
      </div>
    );
  }

  const CurrentPage = useRoute().Component;

  return (
    <AdminLayout>
      <Sidebar />
      <main className="content">
        <CurrentPage />
      </main>
    </AdminLayout>
  );
}

export default App;
