import { useState, useEffect, useCallback } from 'react';
import { UserTable, type UserRecord, type UsersFilters, type UsersPagination } from './components/UserTable';
import { getUsers, updateUserRole, toggleUserActive } from '../../services/api';

function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UsersPagination>({ page: 1, pageSize: 10 });
  const [filters, setFilters] = useState<UsersFilters>({ search: '', role: 'all', status: 'all' });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUsers();
      const mapped: UserRecord[] = data.map((u) => ({
        id: u.id,
        email: u.email,
        username: u.username,
        fullName: u.username,
        role: u.is_admin ? 'admin' : 'user',
        status: u.is_active ? 'active' : 'inactive',
        createdAt: u.created_at,
      }));
      setUsers(mapped);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'فشل تحميل المستخدمين';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  const handleToggleAdmin = useCallback(async (user: UserRecord, admin: boolean) => {
    try {
      await updateUserRole(user.id, admin);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: admin ? 'admin' : 'user' } : u)),
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'فشل تحديث الصلاحية';
      setError(message);
    }
  }, []);

  const handleToggleStatus = useCallback(async (user: UserRecord, status: 'active' | 'inactive') => {
    try {
      await toggleUserActive(user.id);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status } : u)),
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'فشل تحديث الحالة';
      setError(message);
    }
  }, []);

  const handleViewDetails = useCallback((user: UserRecord) => {
    alert(`تفاصيل المستخدم:\nالبريد: ${user.email}\nاسم المستخدم: ${user.username}\nالحالة: ${user.status}`);
  }, []);

  const handleBulkExport = useCallback((_selectedIds: string[]) => {
    const selectedUsers = users.filter((u) => _selectedIds.includes(u.id));
    const csv = [
      ['Email', 'Username', 'Role', 'Status', 'Created'].join(','),
      ...selectedUsers.map((u) =>
        [u.email, u.username, u.role, u.status, u.createdAt].join(','),
      ),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'users-export.csv';
    link.click();
    URL.revokeObjectURL(url);
  }, [users]);

  return (
    <div className="p-8 space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">إدارة المستخدمين</h1>
        <p className="text-slate-400">قائمة المستخدمين المسجلين في المنصة</p>
      </div>
      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}
      <UserTable
        users={users}
        pagination={pagination}
        totalItems={users.length}
        onPaginationChange={setPagination}
        onFiltersChange={setFilters}
        onBulkExport={handleBulkExport}
        onToggleAdmin={handleToggleAdmin}
        onToggleStatus={handleToggleStatus}
        onViewDetails={handleViewDetails}
        selectedIds={selectedIds}
        onSelectedIdsChange={setSelectedIds}
        isLoading={loading}
      />
    </div>
  );
}

export default UsersPage;
