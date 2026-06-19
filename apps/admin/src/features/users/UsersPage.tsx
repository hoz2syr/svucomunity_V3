import { useState, useEffect, useCallback } from 'react';
import { UserTable, type UserRecord } from './components/UserTable';
import { getUsers, updateUserRoleSecure, setUserActiveSecure } from '../../services/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@svu-community/ui/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@svu-community/ui/components/ui/alert-dialog';
import { Input } from '@svu-community/ui/components/ui/input';

function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detailsUser, setDetailsUser] = useState<UserRecord | null>(null);

  const [reauthTarget, setReauthTarget] = useState<{ type: 'role' | 'status'; user: UserRecord; value: boolean } | null>(null);
  const [reauthPassword, setReauthPassword] = useState('');
  const [reauthLoading, setReauthLoading] = useState(false);

  const requestReauth = useCallback((type: 'role' | 'status', user: UserRecord, value: boolean) => {
    setReauthTarget({ type, user, value });
    setReauthPassword('');
  }, []);

  const confirmReauth = useCallback(async () => {
    if (!reauthTarget) return;
    setReauthLoading(true);
    setError(null);
    try {
      if (reauthTarget.type === 'role') {
        await updateUserRoleSecure(reauthTarget.user.id, reauthTarget.value, reauthPassword);
        setUsers((prev) =>
          prev.map((u) => (u.id === reauthTarget.user.id ? { ...u, role: reauthTarget.value ? 'admin' : 'user' } : u)),
        );
      } else {
        await setUserActiveSecure(reauthTarget.user.id, reauthTarget.value, reauthPassword);
        setUsers((prev) =>
          prev.map((u) => (u.id === reauthTarget.user.id ? { ...u, status: reauthTarget.value ? 'active' : 'inactive' } : u)),
        );
      }
      setReauthTarget(null);
      setReauthPassword('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'فشل تنفيذ الإجراء';
      setError(message);
    } finally {
      setReauthLoading(false);
    }
  }, [reauthTarget]);

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

  const handleToggleAdmin = useCallback((user: UserRecord, admin: boolean) => {
    requestReauth('role', user, admin);
  }, [requestReauth]);

  const handleToggleStatus = useCallback((user: UserRecord, nextStatus: 'active' | 'inactive') => {
    requestReauth('status', user, nextStatus === 'active');
  }, [requestReauth]);

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
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive" role="alert" aria-live="assertive">
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

      <AlertDialog open={!!reauthTarget} onOpenChange={(open) => !open && setReauthTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الهوية</AlertDialogTitle>
            <AlertDialogDescription>
              أدخل كلمة مرور الأدمن لتأكيد هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            type="password"
            placeholder="كلمة المرور"
            value={reauthPassword}
            onChange={(e) => setReauthPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void confirmReauth();
            }}
          />
          <AlertDialogFooter>
            <AlertDialogCancel disabled={reauthLoading}>إلغاء</AlertDialogCancel>
            <AlertDialogAction disabled={reauthLoading || !reauthPassword.trim()} onClick={() => void confirmReauth()}>
              {reauthLoading ? 'جارٍ التحقق...' : 'تأكيد'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default UsersPage;
