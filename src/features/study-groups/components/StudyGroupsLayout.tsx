import type { ReactNode } from 'react';
import { StudyGroupsNavbar } from './StudyGroupsNavbar';
import { AppBackground } from '../../../components/AppBackground';

type StudyGroupsLayoutProps = {
  children: ReactNode;
};

export function StudyGroupsLayout({ children }: StudyGroupsLayoutProps) {
  return (
    <div className="min-h-screen text-slate-200 font-sans relative" dir="rtl">
      <AppBackground variant="feature" />
      <StudyGroupsNavbar />
      <main id="main-content" className="relative z-10 px-3 sm:px-4 pb-8">
        {children}
      </main>
    </div>
  );
}
