import type { ReactNode } from 'react';
import { AppBackground } from '../../components/AppBackground';

type DashboardLayoutProps = {
  children: ReactNode;
};

export const DashboardLayout = ({ children }: DashboardLayoutProps) => (
  <div className="min-h-screen text-slate-200 font-sans flex overflow-hidden relative px-4 sm:px-6 lg:px-8" dir="rtl">
    <AppBackground variant="dashboard" />
    {children}
  </div>
);
