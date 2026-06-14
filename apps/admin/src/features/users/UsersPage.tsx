import { useState, useEffect, useCallback } from 'react';
import { UserTable, type UserRecord } from './components/UserTable';
import { getUsers, updateUserRole, setUserActive } from '../../services/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@svu-community/ui/components/ui/dialog';

function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detailsUser, setDetailsUser] = useState<UserRecord | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUsers();
      const mapped: UserRecord[] = data.map((u) => ({
        id: u.id,
        email: u.email,
        username: u.username,
        fullName: (u as unknown as import('@svu-community/types').Profile).display_name || u.username,
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

  const handleToggleStatus = useCallback(async (user: UserRecord, nextStatus: 'active' | 'inactive') => {
    try {
      await setUserActive(user.id, nextStatus === 'active');
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u)),
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'فشل تحديث الحالة';
      setError(message);
    }
  }, []);

  const handleViewDetails = useCallback((user: UserRecord) => {
    setDetailsUser(user);
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
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive" role="alert">
          {error}
        </div>
      )}
      <UserTable
        users={users}
        onBulkExport={handleBulkExport}
        onToggleAdmin={handleToggleAdmin}
        onToggleStatus={handleToggleStatus}
        onViewDetails={handleViewDetails}
        selectedIds={selectedIds}
        onSelectedIdsChange={setSelectedIds}
        isLoading={loading}
      />

      <Dialog open={!!detailsUser} onOpenChange={(open) => !open && setDetailsUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>تفاصيل المستخدم</DialogTitle>
            <DialogDescription>معلومات حساب المستخدم في المنصة</DialogDescription>
          </DialogHeader>
          {detailsUser && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">البريد الإلكتروني</span>
                <span className="font-medium text-white">{detailsUser.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">اسم المستخدم</span>
                <span className="font-medium text-white">{detailsUser.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">الاسم الكامل</span>
                <span className="font-medium text-white">{detailsUser.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">الصلاحية</span>
                <span className={`font-medium ${detailsUser.role === 'admin' ? 'text-indigo-400' : 'text-white'}`}>{detailsUser.role === 'admin' ? 'مدير' : 'مستخدم'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">الحالة</span>
                <span className={`font-medium ${detailsUser.status === 'active' ? 'text-emerald-400' : 'text-rose-400'}`}>{detailsUser.status === 'active' ? 'نشط' : 'معطل'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">تاريخ التسجيل</span>
                <span className="font-medium text-white">{new Date(detailsUser.createdAt).toLocaleDateString('ar-SA')}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default UsersPage;
