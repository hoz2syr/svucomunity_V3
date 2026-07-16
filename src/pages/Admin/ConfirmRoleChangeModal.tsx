'use client';

import { GlassCard } from '@/src/components/ui/GlassCard';
import { Button } from '@/src/components/ui/Button';
import type { RoleOption } from './UserManagement';

type ConfirmRoleChangeProps = {
  target: { userId: string; newRole: RoleOption; userName: string } | null;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
};

export const ConfirmRoleChangeModal = ({ target, onClose, onConfirm, isPending }: ConfirmRoleChangeProps) => {
  if (!target) return null;

  const roleLabel = target.newRole === 'admin' ? 'مشرف' : target.newRole === 'student' ? 'طالب' : 'مستخدم';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <GlassCard className="relative z-10 w-full max-w-md p-6">
        <h2 className="text-lg font-bold text-white mb-2">تأكيد تغيير الدور</h2>
        <p className="text-sm text-slate-400 mb-6">
          هل أنت متأكد من تغيير دور <span className="text-white font-medium">{target.userName}</span> إلى{' '}
          <span className="text-cyan-400 font-medium">{roleLabel}</span>؟
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isPending} className="flex-1">
            إلغاء
          </Button>
          <Button variant="primary" onClick={onConfirm} disabled={isPending} className="flex-1">
            {isPending ? 'جاري التنفيذ...' : 'تأكيد'}
          </Button>
        </div>
      </GlassCard>
    </div>
  );
};
