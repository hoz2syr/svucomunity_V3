'use client';

import { GlassCard } from '@/src/components/ui/GlassCard';
import { Button } from '@/src/components/ui/Button';
import { Icon } from '@/src/components/ui/Icon';
import { User, Mail, Calendar } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import type { AdminUser } from '../../features/admin/services/adminUserService.supabase';
type RoleOption = 'admin' | 'user' | 'student';

const ROLE_LABELS: Record<RoleOption, string> = {
  admin: 'مشرف',
  user: 'مستخدم',
  student: 'طالب',
};

const ROLE_STYLES: Record<RoleOption, string> = {
  admin: 'bg-cyan-500/10 text-cyan-400',
  user: 'bg-white/5 text-slate-400',
  student: 'bg-blue-500/10 text-blue-400',
};

type UserListItemProps = {
  user: AdminUser;
  editingUserId: string | null;
  editingRole: RoleOption;
  isPending: boolean;
  onEdit: (userId: string) => void;
  onSave: (user: AdminUser) => void;
  onCancel: () => void;
  onRoleChange: (role: RoleOption) => void;
};

export function UserListItem({
  user,
  editingUserId,
  editingRole,
  isPending,
  onEdit,
  onSave,
  onCancel,
  onRoleChange,
}: UserListItemProps) {
  const isEditing = editingUserId === user.id;

  return (
    <GlassCard className="p-5">
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
                ROLE_STYLES[user.role as RoleOption] || ROLE_STYLES.user
              )}
            >
              {ROLE_LABELS[user.role as RoleOption] || user.role}
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
          {isEditing ? (
            <>
              <select
                value={editingRole}
                onChange={(e) => onRoleChange(isRoleOption(e.target.value) ? e.target.value : 'user')}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500/50"
              >
                <option value="admin">مشرف</option>
                <option value="user">مستخدم</option>
                <option value="student">طالب</option>
              </select>
              <Button
                variant="primary"
                onClick={() => onSave(user)}
                disabled={isPending}
              >
                حفظ
              </Button>
              <Button variant="ghost" onClick={onCancel}>
                إلغاء
              </Button>
            </>
          ) : (
            <Button
              variant="secondary"
              onClick={() => onEdit(user.id)}
            >
              تعديل الدور
            </Button>
          )}
        </div>
      </div>
    </GlassCard>
  );
}

function isRoleOption(value: string): value is RoleOption {
  return ['admin', 'user', 'student'].includes(value);
}
