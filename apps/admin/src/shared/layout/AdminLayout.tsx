import type { ReactNode } from 'react';

interface AdminLayoutProps {
  sidebar?: ReactNode;
  children: ReactNode;
}

export function AdminLayout({ sidebar, children }: AdminLayoutProps) {
  return (
    <div className="admin-layout flex h-screen">
      {sidebar ?? <aside className="sidebar w-64 border-l border-white/10" />}
      <main className="content flex-1 overflow-auto">{children}</main>
    </div>
  );
}
