import { Link, useLocation } from 'react-router-dom';
import { CalendarDays, Home } from 'lucide-react';

export function ScheduleNavbar() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.08] bg-[var(--color-bg-secondary)] shadow-[var(--shadow-card)]">
      <div className="max-w-6xl mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-2">
          <Link
            to="/dashboard/schedule"
            className="flex items-center gap-3 text-white font-bold text-sm sm:text-base shrink-0 group"
          >
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-md transition-all duration-200 group-hover:shadow-lg group-hover:scale-105">
              <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="hidden sm:inline text-[15px] tracking-tight">استخراج الجدول</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              to="/dashboard/schedule"
              className={`
                relative flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl transition-all duration-200 min-h-[44px]
                ${isActive('/dashboard/schedule')
                  ? 'bg-white/15 text-white ring-1 ring-white/10'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
                }
              `}
            >
              <CalendarDays className={`w-4 h-4 shrink-0 transition-all duration-200 ${isActive('/dashboard/schedule') ? 'text-teal-400 scale-110' : ''}`} />
              <span className="hidden sm:inline">استخراج الجدول</span>
              {isActive('/dashboard/schedule') && (
                <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-[3px] rounded-full bg-teal-400 shadow-md transition-all duration-200" />
              )}
            </Link>
            <Link
              to="/dashboard"
              className="p-2 text-slate-400 hover:text-white transition rounded-xl hover:bg-white/5"
              title="لوحة التحكم"
            >
              <Home className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
