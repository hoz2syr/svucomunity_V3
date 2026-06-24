import { Link } from 'react-router-dom';
import { GraduationCap, Home } from 'lucide-react';

export function StudyGroupsNavbar() {

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#030612]/80 backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.35)]">
      <div className="max-w-6xl mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-2">
          <Link
            to="/dashboard/study-groups"
            className="flex items-center gap-3 text-white font-bold text-sm sm:text-base shrink-0 group"
          >
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all duration-300 group-hover:shadow-[0_0_28px_rgba(6,182,212,0.55)] group-hover:scale-105">
              <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="hidden sm:inline text-[15px] tracking-tight">المجموعات الدراسية</span>
          </Link>

          <div className="flex items-center gap-2">
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
