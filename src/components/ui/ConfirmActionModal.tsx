'use client';

import { GlassCard } from '@/src/components/ui/GlassCard';
import { Button } from '@/src/components/ui/Button';

type ConfirmActionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  isLoading?: boolean;
};

export function ConfirmActionModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'تأكيد',
  isLoading = false,
}: ConfirmActionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <GlassCard className="relative z-10 w-full max-w-md p-6">
        <h2 className="text-lg font-bold text-white mb-2">{title}</h2>
        <p className="text-sm text-slate-400 mb-6">{description}</p>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isLoading} className="flex-1">
            إلغاء
          </Button>
          <Button variant="primary" onClick={onConfirm} disabled={isLoading} className="flex-1">
            {isLoading ? 'جاري التنفيذ...' : confirmLabel}
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}
