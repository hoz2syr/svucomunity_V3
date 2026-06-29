import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle } from 'lucide-react';
import { deleteAccountSchema, type DeleteAccountInput } from '../../schemas/auth.schema';
import { InputField } from '../ui/InputField';
import { ModalOverlay } from './ModalOverlay';

export const DeleteAccountModal = ({ username, onClose, onConfirm }: { username: string; onClose: () => void; onConfirm: () => void }) => {
  const {
    register,
    watch,
    formState: { errors },
  } = useForm<DeleteAccountInput>({
    resolver: zodResolver(deleteAccountSchema),
    mode: 'onChange',
    defaultValues: { confirmation: '' },
  });

  const confirmation = watch('confirmation');
  const isMatch = confirmation === username;

  return (
    <ModalOverlay
      onClose={onClose}
      ariaLabel="حذف الحساب نهائياً"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (isMatch) {
            onConfirm();
          }
        }}
        className="p-8"
      >
        <div className="w-14 h-14 rounded-full bg-[var(--color-danger-light)] text-[var(--color-danger-400)] flex items-center justify-center mb-5">
          <AlertTriangle size={26} strokeWidth={2.5} />
        </div>
        <h3 id="delete-account-modal-title" className="text-xl font-bold text-white mb-3">حذف الحساب نهائياً</h3>
        <p id="delete-account-modal-description" className="text-slate-400 text-sm mb-6 leading-relaxed">
          هذا الإجراء لا يمكن التراجع عنه. سيقوم بحذف حسابك بشكل دائم بالإضافة إلى جميع البيانات المرتبطة به. لتأكيد الحذف، يرجى كتابة <strong className="text-white select-all bg-white/10 px-1 py-0.5 rounded">{username}</strong> أدناه.
        </p>
        <InputField
          label=""
          type="text"
          {...register('confirmation')}
           className="w-full bg-[var(--color-bg-overlay)]/50 flex-1 border border-[var(--color-danger-border)] rounded-xl px-4 py-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-[var(--color-danger)] focus:ring-1 focus:ring-[var(--color-danger-light)] transition-all mb-8 font-sans"
          placeholder={username}
          error={errors.confirmation?.message}
        />
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-300 bg-white/5 hover:bg-white/10 transition-colors">إلغاء</button>
          <button type="submit" disabled={!isMatch} className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-[var(--color-danger)] hover:bg-[var(--color-danger-400)] disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-colors">حذف نهائي</button>
        </div>
      </form>
    </ModalOverlay>
  );
};
