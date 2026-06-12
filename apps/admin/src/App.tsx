import { useState } from 'react';
import { AdminLayout } from './shared/layout/AdminLayout';
import { Sidebar } from './shared/components/Sidebar';

type AdminPage = 'dashboard' | 'users' | 'courses' | 'settings';

function App() {
  const [activePage, setActivePage] = useState<AdminPage>('dashboard');

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
