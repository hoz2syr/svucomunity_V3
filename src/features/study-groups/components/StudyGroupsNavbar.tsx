import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, Home, Sparkles, User } from 'lucide-react';

export function StudyGroupsNavbar() {
  const location = useLocation();
  const isMyGroups = location.pathname === '/dashboard/study-groups/my';

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.08] bg-[var(--color-bg-secondary)] shadow-[var(--shadow-card)]">
      <div className="max-w-6xl mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-2">
          <Link
            to="/dashboard/study-groups"
            className="flex items-center gap-3 text-white font-bold text-sm sm:text-base shrink-0 group"
          >
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-md transition-all duration-200 group-hover:shadow-lg group-hover:scale-105">
              <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="hidden sm:inline text-[15px] tracking-tight">المجموعات الدراسية</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              to="/dashboard/study-groups/my"
              className={`
                relative flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl transition-all duration-200 min-h-[44px]
                ${
                  isMyGroups
                      ? 'bg-white/15 text-white ring-1 ring-white/10'
                      : 'text-slate-400 hover:text-white hover:bg-white/10'
                }
              `}
            >
              <User className={`w-4 h-4 shrink-0 transition-all duration-200 ${isMyGroups ? 'text-indigo-400 scale-110' : ''}`} />
              <span className="hidden sm:inline">مجموعاتي</span>
              {isMyGroups && (
                <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-[3px] rounded-full bg-indigo-400 shadow-md transition-all duration-200" />
              )}
            </Link>

            <Link
              to="/dashboard/schedule"
              className="group relative flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl transition-all duration-200 min-h-[44px] text-slate-400 hover:text-white hover:bg-white/10"
              title="استخراج الجدول بالذكاء الاصطناعي"
            >
              <span className="relative flex items-center justify-center">
                <Sparkles className="w-4 h-4 shrink-0 transition-all duration-200 group-hover:scale-110 group-hover:text-indigo-400" />
                <span className="absolute -inset-1 rounded-full bg-indigo-500/0 group-hover:bg-indigo-500/20 blur-md transition-all duration-300" />
              </span>
              <span className="hidden sm:inline">AI الجدول</span>
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
