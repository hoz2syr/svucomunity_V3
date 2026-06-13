import { useState, useEffect } from 'react';
import { AdminLayout } from './shared/layout/AdminLayout';
import { Sidebar } from './shared/components/Sidebar';
import { useTheme } from '@svu-community/ui';
import DashboardPage from './features/dashboard/DashboardPage';
import UsersPage from './features/users/UsersPage';
import CoursesPage from './features/courses/CoursesPage';
import SettingsPage from './features/settings/SettingsPage';
import { useRoute, registerRoute } from './shared/routing';

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

  useEffect(() => {
    const verifyAccess = async () => {
      setIsLoading(true);
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        if (!supabaseUrl || !supabaseAnonKey) {
          setIsAuthorized(false);
          return;
        }
        const db = createClient(supabaseUrl, supabaseAnonKey, {
          auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
        });
        const { data: { user } } = await db.auth.getUser();
        if (!user?.id) {
          setIsAuthorized(false);
          return;
        }
        const { data: profile } = await db
          .from('users')
          .select('is_admin, is_active')
          .eq('id', user.id)
          .maybeSingle();
        setIsAuthorized(!!profile?.is_admin && !!profile?.is_active);
      } catch {
        setIsAuthorized(false);
      } finally {
        setIsLoading(false);
      }
    };
    verifyAccess();
  }, []);

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
