import type { ReactNode } from 'react';
import { StudyGroupsNavbar } from './StudyGroupsNavbar';

type StudyGroupsLayoutProps = {
  children: ReactNode;
};

export function StudyGroupsLayout({ children }: StudyGroupsLayoutProps) {
  return (
    <div className="min-h-screen bg-[#030612] text-slate-200 font-sans" dir="rtl">
      <StudyGroupsNavbar />
      <main id="main-content" className="relative z-10 px-3 sm:px-4 pb-8">
        {children}
      </main>
    </div>
  );
}
