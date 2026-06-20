import { Link, useLocation } from 'react-router-dom';
import { Home, PlusCircle, FolderOpen, ChevronRight } from 'lucide-react';

const navItems = [
  {
    label: 'الرئيسية',
    path: '/exam',
    icon: Home,
    description: 'الصفحة الرئيسية',
  },
  {
    label: 'إنشاء اختبار',
    path: '/exam/create',
    icon: PlusCircle,
    description: 'من JSON',
  },
  {
    label: 'الاختبارات المحفوظة',
    path: '/exam/saved',
    icon: FolderOpen,
    description: 'المحفوظات',
  },
];

export const ExamNavbar = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/exam') {
      return location.pathname === '/exam';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#030612]/85 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          <Link
            to="/exam"
            className="flex items-center gap-2 text-white font-bold text-sm sm:text-base shrink-0"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-[0_0_18px_rgba(6,182,212,0.35)]">
              <Home className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="hidden xs:inline">الاختبارات</span>
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {navItems.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all
                    ${
                      active
                        ? 'bg-white/10 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.08)]'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-cyan-400' : ''}`} />
                  <span className="hidden sm:inline">{item.label}</span>
                  {active && (
                    <span className="sm:hidden">
                      <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
                    </span>
                  )}

                  {active && (
                    <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.6)]" />
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
