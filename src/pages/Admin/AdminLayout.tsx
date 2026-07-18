'use client';

import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Icon } from '@/src/components/ui/Icon';
import {
  Users,
  FileText,
  BarChart3,
  ShieldCheck,
  TrendingUp,
  Bell,
  Star,
  ChevronRight,
  CalendarDays,
  BookOpen,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

type Tab = 'users' | 'extractions' | 'reports' | 'verification' | 'notifications' | 'reviews' | 'analytics' | 'semester' | 'sources';

const tabs: { id: Tab; label: string; icon: typeof Users; path: string }[] = [
  { id: 'users', label: 'المستخدمين', icon: Users, path: '/admin/users' },
  { id: 'extractions', label: 'الاستخراجات', icon: FileText, path: '/admin/extractions' },
  { id: 'reports', label: 'التقارير', icon: BarChart3, path: '/admin/reports' },
  { id: 'verification', label: 'التحقق', icon: ShieldCheck, path: '/admin/verification' },
  { id: 'notifications', label: 'الإشعارات', icon: Bell, path: '/admin/notifications' },
  { id: 'reviews', label: 'التقييمات', icon: Star, path: '/admin/reviews' },
  { id: 'sources', label: 'المصادر', icon: BookOpen, path: '/admin/sources' },
  { id: 'analytics', label: 'الإحصائيات', icon: TrendingUp, path: '/admin/analytics' },
  { id: 'semester', label: 'الفصل الدراسي', icon: CalendarDays, path: '/admin/semester' },
];

const mobileBottomTabs: { id: Tab; label: string; icon: typeof Users; path: string }[] = [
  { id: 'users', label: 'المستخدمين', icon: Users, path: '/admin/users' },
  { id: 'extractions', label: 'الاستخراجات', icon: FileText, path: '/admin/extractions' },
  { id: 'reports', label: 'التقارير', icon: BarChart3, path: '/admin/reports' },
  { id: 'verification', label: 'التحقق', icon: ShieldCheck, path: '/admin/verification' },
  { id: 'analytics', label: 'الإحصائيات', icon: TrendingUp, path: '/admin/analytics' },
];

const mobileMenuTabs: { id: Tab; label: string; icon: typeof Users; path: string }[] = [
  { id: 'users', label: 'المستخدمين', icon: Users, path: '/admin/users' },
  { id: 'extractions', label: 'الاستخراجات', icon: FileText, path: '/admin/extractions' },
  { id: 'reports', label: 'التقارير', icon: BarChart3, path: '/admin/reports' },
  { id: 'verification', label: 'التحقق', icon: ShieldCheck, path: '/admin/verification' },
  { id: 'notifications', label: 'الإشعارات', icon: Bell, path: '/admin/notifications' },
  { id: 'reviews', label: 'التقييمات', icon: Star, path: '/admin/reviews' },
  { id: 'sources', label: 'المصادر', icon: BookOpen, path: '/admin/sources' },
  { id: 'analytics', label: 'الإحصائيات', icon: TrendingUp, path: '/admin/analytics' },
  { id: 'semester', label: 'الفصل الدراسي', icon: CalendarDays, path: '/admin/semester' },
];

export function AdminLayout() {
  const [activeTab, setActiveTab] = useState<Tab>('users');
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const tabFromPath = (pathname: string): Tab => {
    const match = tabs.find((t) => pathname === t.path || pathname.startsWith(t.path + '/'));
    return match?.id ?? 'users';
  };

  if (location.pathname !== '/admin' && activeTab === 'users' && tabFromPath(location.pathname) !== 'users') {
    setActiveTab(tabFromPath(location.pathname));
  }

  return (
    <div className="min-h-screen text-slate-200 font-sans flex relative" dir="rtl">
      <AppBackground variant="dashboard" />

      <aside className="hidden md:flex w-64 border-l border-white/10 bg-black/20 backdrop-blur-xl flex-col shrink-0">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Icon icon={ShieldCheck} size="md" className="text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">لوحة المشرف</h1>
              <p className="text-slate-400 text-xs">إدارة المنصة</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {tabs.map((tab) => (
            <NavLink
              key={tab.id}
              to={tab.path}
              onClick={() => setActiveTab(tab.id)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                  isActive || activeTab === tab.id
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                )
              }
            >
              <Icon icon={tab.icon} size="sm" />
              <span className="flex-1">{tab.label}</span>
              {activeTab === tab.id && <Icon icon={ChevronRight} size="xs" className="text-cyan-400" />}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <NavLink
            to="/dashboard"
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <Icon icon={ChevronRight} size="xs" className="rotate-180" />
            العودة للوحة التحكم
          </NavLink>
        </div>
      </aside>

      <main className="flex-1 overflow-auto pb-20 md:pb-0">
        <div className="max-w-6xl mx-auto p-4 md:p-6">
          <Outlet />
        </div>
      </main>

      <header className="md:hidden fixed top-0 inset-x-0 z-40 h-14 bg-black/40 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Icon icon={ShieldCheck} size="sm" className="text-white" />
          </div>
          <span className="text-white font-bold text-sm">لوحة المشرف</span>
        </div>
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="فتح القائمة"
        >
          <Icon icon={menuOpen ? X : Menu} size="sm" />
        </button>
      </header>

      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-slate-950/95 backdrop-blur-xl border-l border-white/10 flex flex-col">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <Icon icon={ShieldCheck} size="md" className="text-white" />
                </div>
                <div>
                  <h2 className="text-white font-bold">لوحة المشرف</h2>
                  <p className="text-slate-400 text-xs">إدارة المنصة</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="إغلاق القائمة"
              >
                <Icon icon={X} size="sm" />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {mobileMenuTabs.map((tab) => (
                <NavLink
                  key={tab.id}
                  to={tab.path}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMenuOpen(false);
                  }}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                      isActive || activeTab === tab.id
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                    )
                  }
                >
                  <Icon icon={tab.icon} size="sm" />
                  <span>{tab.label}</span>
                  {activeTab === tab.id && <Icon icon={ChevronRight} size="xs" className="text-cyan-400 mr-auto" />}
                </NavLink>
              ))}
            </nav>
            <div className="p-4 border-t border-white/10">
              <NavLink
                to="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
              >
                <Icon icon={ChevronRight} size="xs" className="rotate-180" />
                العودة للوحة التحكم
              </NavLink>
            </div>
          </div>
        </div>
      )}

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-black/70 backdrop-blur-xl border-t border-white/10" aria-label="التنقل السفلي">
        <div className="flex items-center justify-around">
          {mobileBottomTabs.map((tab) => (
            <NavLink
              key={tab.id}
              to={tab.path}
              onClick={() => setActiveTab(tab.id)}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-0.5 py-2 px-2 flex-1 transition-colors',
                  isActive || activeTab === tab.id ? 'text-cyan-400' : 'text-slate-500'
                )
              }
            >
              {({ isActive }: { isActive: boolean }) => (
                <>
                  <Icon icon={tab.icon} size="sm" className={isActive || activeTab === tab.id ? 'text-cyan-400' : ''} />
                  <span className="text-[10px] leading-tight">{tab.label}</span>
                  {(isActive || activeTab === tab.id) && (
                    <span className="w-4 h-0.5 rounded-full bg-cyan-400 mt-0.5" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}

function AppBackground({ variant: _variant }: { variant: string }) {
  return (
    <div className="fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
