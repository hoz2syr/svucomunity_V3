import type { ReactNode } from 'react';

type DashboardLayoutProps = {
  children: ReactNode;
};

export const DashboardLayout = ({ children }: DashboardLayoutProps) => (
  <div className="min-h-screen bg-[var(--color-bg-tertiary)] text-slate-200 font-sans flex overflow-hidden relative px-4 sm:px-6 lg:px-8" dir="rtl">
    <div className="fixed inset-0 bg-gradient-to-br from-[var(--color-bg-tertiary)] via-[var(--color-bg-secondary)] to-[var(--color-bg-tertiary)] pointer-events-none" />

    <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-cyan-900/8 blur-[180px] rounded-full pointer-events-none" />
    <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-900/10 blur-[160px] rounded-full pointer-events-none" />

    {children}
  </div>
);
