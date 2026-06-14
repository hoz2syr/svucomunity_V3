import { LayoutDashboard, Users, BookOpen, Users2, Settings } from 'lucide-react';
import { Link, isActive } from '../routing';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'users', label: 'المستخدمون', icon: Users, path: '/users' },
  { id: 'courses', label: 'المقررات', icon: BookOpen, path: '/courses' },
  { id: 'groups', label: 'المجموعات', icon: Users2, path: '/groups' },
  { id: 'settings', label: 'الإعدادات', icon: Settings, path: '/settings' },
] as const;

export function Sidebar() {
  return (
    <aside className="sidebar">
      <nav className="flex flex-col gap-1 p-4">
        {NAV_ITEMS.map(({ id, label, icon: Icon, path }) => {
          const active = isActive(path);
          return (
            <Link
              key={id}
              to={path}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                active
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
