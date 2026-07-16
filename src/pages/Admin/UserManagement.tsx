'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { Button } from '@/src/components/ui/Button';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { Icon } from '@/src/components/ui/Icon';
import { useAdminUsers, useUpdateUserRole } from '../../features/admin/hooks/useAdminUsers';
import {
  Search,
  Shield,
  User,
  Mail,
  Calendar,
  FileText,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import type { AdminUser } from '../../features/admin/services/adminUserService.supabase';

type RoleOption = 'admin' | 'user' | 'student';

export function UserManagement() {
  const { profile, loading: authLoading } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<RoleOption>('user');
  const [confirmTarget, setConfirmTarget] = useState<{ userId: string; newRole: RoleOption; userName: string } | null>(null);

  const { data: users, isLoading: usersLoading, error: usersError, refetch } = useAdminUsers();
  const updateRoleMutation = useUpdateUserRole();

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter((user) => {
      const matchesSearch =
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = selectedRole === 'all' || user.role === selectedRole;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, selectedRole]);

  const roleCounts = useMemo(() => {
    if (!users) return { admin: 0, user: 0, student: 0 };
    return users.reduce(
      (acc: { admin: number; user: number; student: number }, u: AdminUser) => {
        const role = u.role || 'user';
        if (role === 'admin') acc.admin++;
        else if (role === 'student') acc.student++;
        else acc.user++;
        return acc;
      },
      { admin: 0, user: 0, student: 0 }
    );
  }, [users]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-cyan-400 text-lg">جاري التحميل...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <GlassCard className="p-8 text-center max-w-md">
          <Icon icon={Shield} size="xl" className="text-rose-400 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">غير مصرح</h2>
          <p className="text-slate-400 text-sm">ليس لديك صلاحية الوصول لهذه الصفحة</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 pt-4">
        <h1 className="text-3xl font-bold text-white tracking-tight">إدارة المستخدمين</h1>
        <p className="text-slate-400 text-sm max-w-xl">
          عرض وإدارة جميع مستخدمي المنصة
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
              <Icon icon={Shield} size="sm" className="text-cyan-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{roleCounts.admin}</p>
              <p className="text-xs text-slate-400">مشرفين</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Icon icon={User} size="sm" className="text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{roleCounts.user}</p>
              <p className="text-xs text-slate-400">مستخدمين</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Icon icon={FileText} size="sm" className="text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{roleCounts.student}</p>
              <p className="text-xs text-slate-400">طلاب</p>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Icon icon={Search} size="sm" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="بحث بالاسم، البريد، أو اسم المستخدم..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500/50"
        >
          <option value="all">كل الأدوار</option>
          <option value="admin">مشرف</option>
          <option value="user">مستخدم</option>
          <option value="student">طالب</option>
        </select>
        <Button
          variant="secondary"
          onClick={() => refetch()}
          icon={<Icon icon={RefreshCw} size="xs" />}
        >
          تحديث
        </Button>
      </div>

      {usersError && (
        <GlassCard className="p-4 border-rose-500/30">
          <div className="flex items-center gap-2 text-rose-400">
            <Icon icon={AlertTriangle} size="sm" />
            <span className="text-sm">{usersError instanceof Error ? usersError.message : 'حدث خطأ'}</span>
          </div>
        </GlassCard>
      )}

      {usersLoading ? (
        <div className="grid gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <GlassCard key={i} className="p-5">
              <Skeleton className="w-full h-16" />
            </GlassCard>
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <GlassCard className="p-8 text-center">
          <Icon icon={CheckCircle2} size="xl" className="text-emerald-400 mb-3" />
          <p className="text-slate-400 text-sm">لا يوجد مستخدمين</p>
        </GlassCard>
      ) : (
        <div className="grid gap-4">
          {filteredUsers.map((user: AdminUser) => (
            <GlassCard key={user.id} className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon icon={User} size="sm" className="text-cyan-400 shrink-0" />
                    <h3 className="text-white font-medium truncate">
                      {user.full_name || 'بدون اسم'}
                    </h3>
                    <span
                      className={cn(
                        'text-xs px-2 py-0.5 rounded-lg',
                        user.role === 'admin'
                          ? 'bg-cyan-500/10 text-cyan-400'
                          : user.role === 'student'
                          ? 'bg-blue-500/10 text-blue-400'
                          : 'bg-white/5 text-slate-400'
                      )}
                    >
                      {user.role === 'admin' ? 'مشرف' : user.role === 'student' ? 'طالب' : 'مستخدم'}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    {user.email && (
                      <span className="flex items-center gap-1">
                        <Icon icon={Mail} size="xs" />
                        {user.email}
                      </span>
                    )}
                    {user.username && (
                      <span className="font-mono">@{user.username}</span>
                    )}
                    {user.major && (
                      <span className="px-2 py-0.5 bg-white/5 rounded-lg">{user.major}</span>
                    )}
                    <span className="flex items-center gap-1">
                      <Icon icon={Calendar} size="xs" />
                      {new Date(user.created_at).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {editingUserId === user.id ? (
                    <>
                      <select
                        value={editingRole}
                        onChange={(e) => setEditingRole(e.target.value as RoleOption)}
                        className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500/50"
                      >
                        <option value="admin">مشرف</option>
                        <option value="user">مستخدم</option>
                        <option value="student">طالب</option>
                      </select>
                      <Button
                        variant="primary"
                        onClick={() =>
                          setConfirmTarget({
                            userId: user.id,
                            newRole: editingRole,
                            userName: user.full_name || user.email || user.id,
                          })
                        }
                        disabled={updateRoleMutation.isPending}
                      >
                        حفظ
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setEditingUserId(null)}
                      >
                        إلغاء
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setEditingUserId(user.id);
                        setEditingRole((user.role as RoleOption) || 'user');
                      }}
                    >
                      تعديل الدور
                    </Button>
                  )}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {confirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmTarget(null)} />
          <GlassCard className="relative z-10 w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-white mb-2">تأكيد تغيير الدور</h2>
            <p className="text-sm text-slate-400 mb-6">
              هل أنت متأكد من تغيير دور <span className="text-white font-medium">{confirmTarget.userName}</span> إلى{' '}
              <span className="text-cyan-400 font-medium">
                {confirmTarget.newRole === 'admin' ? 'مشرف' : confirmTarget.newRole === 'student' ? 'طالب' : 'مستخدم'}
              </span>؟
            </p>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => setConfirmTarget(null)}
                disabled={updateRoleMutation.isPending}
                className="flex-1"
              >
                إلغاء
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  updateRoleMutation.mutate(
                    { userId: confirmTarget.userId, newRole: confirmTarget.newRole },
                    {
                      onSuccess: () => {
                        setConfirmTarget(null);
                        setEditingUserId(null);
                      },
                      onError: () => setConfirmTarget(null),
                    }
                  );
                }}
                disabled={updateRoleMutation.isPending}
                className="flex-1"
              >
                {updateRoleMutation.isPending ? 'جاري التنفيذ...' : 'تأكيد'}
              </Button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
