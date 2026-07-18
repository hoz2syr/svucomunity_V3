import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { GraduationCap, FileText, CalendarDays } from 'lucide-react';
import { profileSchema, type ProfileInput } from '../../schemas/auth.schema';
import { InputField } from '../ui/InputField';
import { Dropdown } from '../ui/Dropdown';
import { useProfileSettings } from '@/src/hooks/useProfileSettings';
import { getAllMajorsStatic, getAllLevelsStatic } from '@/src/features/study-groups/services/courseCatalog';
import { Button } from '../ui/Button';

type ProfileSettingsFormProps = {
  userId: string;
  initial: ProfileInput;
  onSubmit: (data: ProfileInput) => Promise<string | null>;
  onTakeSpecializationTest?: (major: string) => void;
};

const SEMESTER_OPTIONS = [
  { value: '', label: 'بدون تحديد' },
  { value: 'F23', label: '2023/2024 - الفصل الأول' },
  { value: 'S23', label: '2023/2024 - الفصل الثاني' },
  { value: 'F24', label: '2024/2025 - الفصل الأول' },
  { value: 'S24', label: '2024/2025 - الفصل الثاني' },
  { value: 'F25', label: '2025/2026 - الفصل الأول' },
  { value: 'S25', label: '2025/2026 - الفصل الثاني' },
  { value: 'F26', label: '2026/2027 - الفصل الأول' },
  { value: 'S26', label: '2026/2027 - الفصل الثاني' },
];

export const ProfileSettingsForm = ({ userId: _userId, initial, onSubmit, onTakeSpecializationTest }: ProfileSettingsFormProps) => {
  const { isLoading, successMsg, errorMsg, submit } = useProfileSettings(onSubmit);
  const [majors, setMajors] = useState<string[]>([]);
  const [loadingMajors, setLoadingMajors] = useState(true);
  const [levels, setLevels] = useState<string[]>([]);
  const [loadingLevels, setLoadingLevels] = useState(true);

  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: initial,
    mode: 'onBlur',
  });

  const selectedMajor = form.watch('major');
  const selectedLevel = form.watch('level');
  const selectedSemester = form.watch('current_semester');

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

  useEffect(() => {
    let cancelled = false;
    setLoadingLevels(true);
    getAllLevelsStatic().then((staticLevels) => {
      if (!cancelled) {
        setLevels(staticLevels);
        setLoadingLevels(false);
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
        />
      </div>
      <div>
        <label className="block text-slate-300 text-sm mb-2 font-medium">
          <GraduationCap className="w-4 h-4 inline-block ml-1.5 text-cyan-400" />
          السنة الدراسية
        </label>
        <Dropdown
          searchable
          value={selectedLevel || ''}
          onChange={(value) => form.setValue('level', value)}
          options={levels.map((l) => ({ value: l, label: `السنة ${l}` }))}
          placeholder={loadingLevels ? 'جاري تحميل السنوات...' : 'اختر السنة...'}
          searchPlaceholder="ابحث بالسنة..."
          error={form.formState.errors.level?.message}
          className="font-mono"
        />
      </div>
      <div>
        <label className="block text-slate-300 text-sm mb-2 font-medium">
          <CalendarDays className="w-4 h-4 inline-block ml-1.5 text-orange-400" />
          الفصل الحالي
        </label>
        <Dropdown
          value={selectedSemester || ''}
          onChange={(value) => form.setValue('current_semester', value)}
          options={SEMESTER_OPTIONS}
          placeholder="اختر الفصل الحالي..."
          error={form.formState.errors.current_semester?.message}
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
