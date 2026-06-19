import type { ReactNode } from 'react';

interface AdminLayoutProps {
  sidebar?: ReactNode;
  children: ReactNode;
}

export function AdminLayout({ sidebar, children }: AdminLayoutProps) {
  return (
    <div className="admin-layout flex h-screen">
      <header aria-label="القائمة الجانبية" className="sidebar w-64 border-l border-white/10">
        {sidebar}
      </header>
      <main className="content flex-1 overflow-auto" aria-label="المحتوى الرئيسي">
        {children}
      </main>
    </div>
  );
}
