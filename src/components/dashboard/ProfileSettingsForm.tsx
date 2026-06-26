import { motion } from 'motion/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, type ProfileInput } from '../../schemas/auth.schema';
import { InputField } from '../ui/InputField';
import { useProfileSettings } from './useProfileSettings';

type ProfileSettingsFormProps = {
  userId: string;
  initial: ProfileInput;
  onSubmit: (data: ProfileInput) => Promise<string | null>;
};

export const ProfileSettingsForm = ({ userId: _userId, initial, onSubmit }: ProfileSettingsFormProps) => {
  const { isLoading, successMsg, errorMsg, submit } = useProfileSettings(onSubmit);
  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: initial,
    mode: 'onBlur',
  });

  const handleSubmit = async (data: ProfileInput) => {
    await submit(data);
  };

  return (
    <motion.form
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      onSubmit={form.handleSubmit(handleSubmit)}
      className="space-y-5"
    >
      <InputField label="الاسم الكامل" type="text" {...form.register('full_name')} error={form.formState.errors.full_name?.message} />
      <InputField label="اسم المستخدم" type="text" {...form.register('username')} error={form.formState.errors.username?.message} />
      <InputField label="البريد الإلكتروني" type="email" {...form.register('email')} error={form.formState.errors.email?.message} />
      {successMsg && (
        <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-emerald-400 text-sm font-medium flex items-center gap-1">
          {successMsg}
        </motion.p>
      )}
      {errorMsg && (
        <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-[var(--color-danger-400)] text-sm font-medium">
          {errorMsg}
        </motion.p>
      )}
      <div className="pt-4 flex justify-end gap-3">
        <button type="button" className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-300 bg-white/5 hover:bg-white/10 transition-colors">إغلاق</button>
        <button type="submit" disabled={isLoading} className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-cyan-600 hover:bg-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.2)] flex items-center gap-2 transition-all">
          {isLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </button>
      </div>
    </motion.form>
  );
};
