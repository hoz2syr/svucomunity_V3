import type { ReactNode } from 'react';
import { ExamNavbar } from './ExamNavbar';
import { ArrowRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { SkipLink } from '../../../components/accessibility/SkipLink';

type ExamLayoutProps = {
  children: ReactNode;
};

export const ExamLayout = ({ children }: ExamLayoutProps) => {
  const location = useLocation();
  const isOnExamPage = location.pathname.includes('/exam/saved/play/');

  return (
    <div className="min-h-screen bg-[#030612] text-slate-200 font-sans pt-4 px sm:px-4" dir="rtl">
      <SkipLink />
      <ExamNavbar />
      <div id="main-content" className="relative z-10 px-3 sm:px-4">
        {children}
      </div>
      {!isOnExamPage && (
        <Link
          to="/dashboard"
          className="fixed bottom-4 left-4 z-10 sm:bottom-6 sm:left-6 flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white px-3 py-2 sm:px-4 sm:py-2.5 rounded-full border border-white/10 backdrop-blur-md transition-all shadow-lg"
          title="العودة للوحة التحكم"
        >
          <ArrowRight className="w-4 h-4" />
          <span className="text-sm font-medium">لوحة التحكم</span>
        </Link>
      )}
    </div>
  );
};
