import type { ReactNode } from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SkipLink } from '../../../components/accessibility/SkipLink';
import { AppBackground } from '../../../components/AppBackground';

type SubjectsLayoutProps = {
  children: ReactNode;
};

export function SubjectsLayout({ children }: SubjectsLayoutProps) {
  return (
    <div className="min-h-screen text-slate-200 font-sans relative" dir="rtl">
      <AppBackground variant="feature" />
      <SkipLink />
      <header className="fixed top-0 left-0 right-0 h-16 bg-slate-900/80 backdrop-blur-md border-b border-white/8 z-50 flex items-center justify-between px-6">
        <Link to="/dashboard" className="flex items-center gap-3 text-white hover:text-cyan-400 transition-colors">
          <ArrowRight className="w-5 h-5" />
          <span className="font-bold">لوحة التحكم</span>
        </Link>
        <div className="flex items-center gap-2 text-orange-400 font-bold">
          <BookOpen className="w-4 h-4" />
          <span>المصادر</span>
        </div>
      </header>
      <main id="main-content" className="relative z-10 pt-24 px-4 sm:px-6 pb-32">
        {children}
      </main>
    </div>
  );
}
