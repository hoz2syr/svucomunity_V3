import type { ReactNode } from 'react';
import { ExamNavbar } from './ExamNavbar';
import { ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

type ExamLayoutProps = {
  children: ReactNode;
};

export const ExamLayout = ({ children }: ExamLayoutProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#030612] text-slate-200 font-sans" dir="rtl">
      <ExamNavbar />
      {children}
      <Link
        to="/dashboard"
        className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white px-4 py-2.5 rounded-full border border-white/10 backdrop-blur-md transition-all shadow-lg"
        title="العودة للوحة التحكم"
      >
        <ArrowRight className="w-4 h-4" />
        <span className="text-sm font-medium">لوحة التحكم</span>
      </Link>
    </div>
  );
};
