import { Link, useLocation } from 'react-router-dom';
import { Home, PlusCircle, FolderOpen, Globe } from 'lucide-react';

const NAV_ITEMS = [
  {
    label: 'الاختبارات المحفوظة',
    path: '/exam/saved',
    icon: FolderOpen,
  },
  {
    label: 'الرئيسية',
    path: '/exam/home',
    icon: Home,
  },
  {
    label: 'إنشاء اختبار',
    path: '/exam/create',
    icon: PlusCircle,
  },
  {
    label: 'الاختبارات المنشورة',
    path: '/exam/browse',
    icon: Globe,
  },
] as const;

export const ExamNavbar = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/exam/home') {
      return location.pathname === '/exam/home';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.08] bg-[var(--color-bg-secondary)] shadow-[var(--shadow-card)]">
      <div className="max-w-6xl mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-2">
          <Link
            to="/exam"
            className="flex items-center gap-3 text-white font-bold text-sm sm:text-base shrink-0 group"
          >
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-md transition-all duration-200 group-hover:shadow-lg group-hover:scale-105">
              <Home className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="hidden sm:inline text-[15px] tracking-tight">الاختبارات</span>
          </Link>

          <div className="flex items-center gap-1 sm:gap-1.5">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 min-h-[44px]
                    ${
                      active
                          ? 'bg-white/15 text-white ring-1 ring-white/10'
                          : 'text-slate-400 hover:text-white hover:bg-white/10'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 sm:w-[18px] sm:h-[18px] shrink-0 transition-all duration-200 ${active ? 'text-indigo-400 scale-110' : ''}`} />
                  <span className="hidden sm:inline">{item.label}</span>

                  {active && (
                    <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-[3px] rounded-full bg-indigo-400 shadow-md transition-all duration-200" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};
