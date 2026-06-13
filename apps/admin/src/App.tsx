import { useState, useEffect } from 'react';
import { AdminLayout } from './shared/layout/AdminLayout';
import { Sidebar } from './shared/components/Sidebar';
import { useTheme } from '@svu-community/ui';

type AdminPage = 'dashboard' | 'users' | 'courses' | 'settings';

function App() {
  const [activePage, setActivePage] = useState<AdminPage>('dashboard');
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { theme, setLight, setDark, setSystem } = useTheme();

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

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'users':
        return <UsersPage />;
      case 'courses':
        return <CoursesPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <AdminLayout>
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <main className="content">
        {renderPage()}
      </main>
    </AdminLayout>
  );
}

export default App;

function DashboardPage() {
  return (
    <div className="p-8" dir="rtl">
      <h1 className="text-2xl font-bold text-white mb-6">لوحة التحكم</h1>
      <p className="text-slate-400">مرحباً بك في لوحة تحكم الإدارة</p>
    </div>
  );
}

function UsersPage() {
  return (
    <div className="p-8" dir="rtl">
      <h1 className="text-2xl font-bold text-white mb-6">إدارة المستخدمين</h1>
      <p className="text-slate-400">قائمة المستخدمين المسجلين في المنصة</p>
    </div>
  );
}

function CoursesPage() {
  return (
    <div className="p-8" dir="rtl">
      <h1 className="text-2xl font-bold text-white mb-6">إدارة المقررات</h1>
      <p className="text-slate-400">إضافة وتعديل وحذف المقررات الدراسية</p>
    </div>
  );
}

function SettingsPage() {
  return (
    <div className="p-8" dir="rtl">
      <h1 className="text-2xl font-bold text-white mb-6">الإعدادات</h1>
      <p className="text-slate-400">إعدادات التطبيق والنظام</p>
    </div>
  );
}
