export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-layout">
      <aside className="sidebar" />
      <main className="content">{children}</main>
    </div>
  );
}
