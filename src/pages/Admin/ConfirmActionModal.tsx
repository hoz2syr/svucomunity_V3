'use client';

import { GlassCard } from '@/src/components/ui/GlassCard';
import { Button } from '@/src/components/ui/Button';
import { Icon } from '@/src/components/ui/Icon';

type ConfirmAction = { type: 'course'; courseCode: string; isVerified: boolean; courseName: string } | { type: 'instructor'; instructorUsername: string; isVerified: boolean; instructorName: string };

type ConfirmActionModalProps = {
  action: ConfirmAction;
  onClose: () => void;
  onConfirm: () => void;
  isCoursePending: boolean;
  isInstructorPending: boolean;
};

export const ConfirmActionModal = ({ action, onClose, onConfirm, isCoursePending, isInstructorPending }: ConfirmActionModalProps) => {
  const isPending = action.type === 'course' ? isCoursePending : isInstructorPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <GlassCard className="relative z-10 w-full max-w-md p-6">
        <h2 className="text-lg font-bold text-white mb-2">
          {action.isVerified ? 'تأكيد التحقق' : 'تأكيد الرفض'}
        </h2>
        <p className="text-sm text-slate-400 mb-6">
          {action.type === 'course' ? (
            <>
              هل أنت متأكد من {action.isVerified ? 'تحقق' : 'رفض'} المادة{' '}
              <span className="text-white font-medium">{action.courseName}</span>؟
            </>
          ) : (
            <>
              هل أنت متأكد من {action.isVerified ? 'تحقق' : 'رفض'} المحاضر{' '}
              <span className="text-white font-medium">{action.instructorName}</span>؟
            </>
          )}
        </p>
        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isPending}
            className="flex-1"
          >
            إلغاء
          </Button>
          <Button
            variant={action.isVerified ? 'primary' : 'danger'}
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1"
          >
            {isPending ? 'جاري التنفيذ...' : 'تأكيد'}
          </Button>
        </div>
      </GlassCard>
    </div>
  );
};
