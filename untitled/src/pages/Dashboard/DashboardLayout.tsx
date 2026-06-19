import type { ReactNode } from 'react';

type DashboardLayoutProps = {
  children: ReactNode;
};

export const DashboardLayout = ({ children }: DashboardLayoutProps) => (
  <div className="min-h-screen bg-[#030612] text-slate-200 font-sans flex overflow-hidden" dir="rtl">
    {children}
  </div>
);
