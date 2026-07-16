import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { GraduationCap, FileText } from 'lucide-react';
import { profileSchema, type ProfileInput } from '../../schemas/auth.schema';
import { InputField } from '../ui/InputField';
import { Dropdown } from '../ui/Dropdown';
import { useProfileSettings } from './useProfileSettings';
import { getAllMajorsStatic } from '@/src/features/study-groups/services/courseCatalog';
import { Button } from '../ui/Button';

type ProfileSettingsFormProps = {
  userId: string;
  initial: ProfileInput;
  onSubmit: (data: ProfileInput) => Promise<string | null>;
  onTakeSpecializationTest?: (major: string) => void;
};

export const ProfileSettingsForm = ({ userId: _userId, initial, onSubmit, onTakeSpecializationTest }: ProfileSettingsFormProps) => {
  const { isLoading, successMsg, errorMsg, submit } = useProfileSettings(onSubmit);
  const [majors, setMajors] = useState<string[]>([]);
  const [loadingMajors, setLoadingMajors] = useState(true);

  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema as any),
    defaultValues: initial,
    mode: 'onBlur',
  });

  const selectedMajor = form.watch('major');

  useEffect(() => {
    let cancelled = false;
    setLoadingMajors(true);
    getAllMajorsStatic().then((list) => {
      if (!cancelled) {
        setMajors(list);
        setLoadingMajors(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  const handleSubmit = async (data: ProfileInput) => {
    await submit(data);
  };

  const handleTakeTest = () => {
    const major = form.getValues('major');
    if (major && onTakeSpecializationTest) {
      onTakeSpecializationTest(major);
    }
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
      <div>
        <label className="block text-slate-300 text-sm mb-2 font-medium">
          <GraduationCap className="w-4 h-4 inline-block ml-1.5 text-cyan-400" />
          التخصص
        </label>
        <Dropdown
          searchable
          value={selectedMajor || ''}
          onChange={(value) => form.setValue('major', value)}
          options={majors.map((m) => ({ value: m, label: m }))}
          placeholder={loadingMajors ? 'جاري تحميل التخصصات...' : 'اختر التخصص...'}
          searchPlaceholder="ابحث بالتخصص..."
          error={form.formState.errors.major?.message}
          className="font-mono"
        />
      </div>
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
      <div className="pt-4 flex flex-col gap-3">
        <div className="flex justify-end gap-3">
          <button type="button" className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-300 bg-white/5 hover:bg-white/10 transition-colors">إغلاق</button>
          <button type="submit" disabled={isLoading} className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md flex items-center gap-2 transition-all">
            {isLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </button>
        </div>
        {selectedMajor && (
          <Button type="button" variant="secondary" onClick={handleTakeTest} className="w-full flex items-center justify-center gap-2">
            <FileText className="w-4 h-4" />
            خوض اختبار التخصص
          </Button>
        )}
      </div>
    </motion.form>
  );
};
