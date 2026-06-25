"use client";

import { useState, useEffect } from 'react';
import { Users, BookOpen, Calendar, GraduationCap, MessageCircle, Link2 } from 'lucide-react';
import { Dropdown } from '@/src/components/ui/Dropdown';
import type { Course } from '../types';
import { PrimaryButton } from '@/src/components/ui/PrimaryButton';
import { useAuth } from '@/src/contexts/AuthContext';
import { studyGroupService } from '../core/services';

export default function CreateGroupPage() {
  const { session, profile } = useAuth();
  const userId = session?.user?.id;
  const [groupName, setGroupName] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedMajor, setSelectedMajor] = useState('');
  const [maxMembers, setMaxMembers] = useState(5);
  const [whatsappLink, setWhatsappLink] = useState('');
  const [groupLink, setGroupLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [courses, setCourses] = useState<Course[]>([]);
  const [majors, setMajors] = useState<string[]>([]);

  const CLASSES = ['C1', 'C2', 'C3', 'C4', 'C5'];

  useEffect(() => {
    const loadMajors = async () => {
      try {
        const majorsData = await studyGroupService.getAvailableMajors();
        setMajors(majorsData);
      } catch {
        setMajors([]);
      }
    };
    loadMajors();
  }, []);

  useEffect(() => {
    if (profile?.major) {
      setSelectedMajor(profile.major || '');
      studyGroupService.getCoursesByMajor(profile.major || '').then(setCourses);
    }
  }, [profile]);

  useEffect(() => {
    if (selectedMajor) {
      studyGroupService.getCoursesByMajor(selectedMajor).then(setCourses);
    } else {
      setCourses([]);
    }
  }, [selectedMajor]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!groupName.trim()) newErrors.name = 'يرجى إدخال اسم المجموعة';
    if (!selectedCourse) newErrors.course = 'يرجى اختيار المادة';
    if (!selectedClass) newErrors.class_ = 'يرجى اختيار الصف';
    if (!selectedMajor) newErrors.major = 'الرجاء اختيار التخصص';
    if (maxMembers < 2 || maxMembers > 20) newErrors.maxMembers = 'العدد يجب أن يكون بين 2 و 20';
    if (!whatsappLink.trim()) newErrors.whatsapp = 'يرجى إدخال رابط مجموعة الواتساب';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !userId || !profile) return;

    setIsSubmitting(true);
    try {
      await studyGroupService.createGroup({
        name: groupName.trim(),
        course_name: selectedCourse!.name,
        course_code: selectedCourse!.code,
        class_number: selectedClass,
        major: selectedMajor,
        max_members: maxMembers,
        whatsapp_link: whatsappLink.trim(),
        group_link: groupLink.trim() || undefined,
        doctor_name: '',
        creator_id: userId,
        creator_name: profile?.full_name || profile?.username || 'مستخدم',
      });
      window.location.href = '/dashboard/study-groups';
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'فشل إنشاء المجموعة' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const courseOptions = courses.map((c) => ({ value: c.code, label: c.name, sublabel: c.code }));
  const classOptions = CLASSES.map((c) => ({ value: c, label: c }));
  const majorOptions = majors.map((m) => ({ value: m, label: m }));

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 pt-6 pb-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
          إنشاء مجموعة جديدة
        </h1>
        <p className="text-slate-400 text-sm">
          أنشئ مجموعة دراسية للتعاون مع زملائك
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-slate-300 text-sm mb-2 font-medium">
            <Users className="w-4 h-4 inline-block ml-1.5 text-cyan-400" />
            اسم المجموعة <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className={`
              input-field w-full px-4 py-3 rounded-xl text-white text-sm
              ${errors.name ? 'border-rose-500/50 bg-rose-500/5' : ''}
            `}
            placeholder="مثال: مجموعة مراجعة C1 - فصل الربيع"
          />
          {errors.name && <p className="text-rose-400 text-xs mt-1.5">{errors.name}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 text-sm mb-2 font-medium">
              <BookOpen className="w-4 h-4 inline-block ml-1.5 text-cyan-400" />
              المادة <span className="text-rose-400">*</span>
            </label>
            <Dropdown
              value={selectedCourse?.code || ''}
              onChange={(code) => {
                const course = courses.find((c) => c.code === code) || null;
                setSelectedCourse(course);
              }}
              options={courseOptions}
              placeholder="اختر المادة..."
              error={errors.course}
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm mb-2 font-medium">
              <Calendar className="w-4 h-4 inline-block ml-1.5 text-cyan-400" />
              الصف <span className="text-rose-400">*</span>
            </label>
            <Dropdown
              value={selectedClass}
              onChange={setSelectedClass}
              options={classOptions}
              placeholder="اختر الصف..."
              error={errors.class_}
              className="font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 text-sm mb-2 font-medium">
              <GraduationCap className="w-4 h-4 inline-block ml-1.5 text-cyan-400" />
              التخصص <span className="text-rose-400">*</span>
            </label>
            <Dropdown
              value={selectedMajor}
              onChange={setSelectedMajor}
              options={majorOptions}
              placeholder="اختر التخصص..."
              error={errors.major}
              className="font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm mb-2 font-medium">
              <Users className="w-4 h-4 inline-block ml-1.5 text-cyan-400" />
              عدد الأعضاء <span className="text-rose-400">*</span>
            </label>
            <input
              type="number"
              min={2}
              max={20}
              value={maxMembers}
              onChange={(e) => setMaxMembers(parseInt(e.target.value) || 2)}
              className={`
                input-field w-full px-4 py-3 rounded-xl text-white text-sm
                ${errors.maxMembers ? 'border-rose-500/50 bg-rose-500/5' : ''}
              `}
            />
            {errors.maxMembers && <p className="text-rose-400 text-xs mt-1.5">{errors.maxMembers}</p>}
          </div>
        </div>

        <div>
          <label className="block text-slate-300 text-sm mb-2 font-medium">
            <MessageCircle className="w-4 h-4 inline-block ml-1.5 text-emerald-400" />
            رابط مجموعة الواتساب <span className="text-rose-400">*</span>
          </label>
          <input
            type="url"
            value={whatsappLink}
            onChange={(e) => setWhatsappLink(e.target.value)}
            className={`
              input-field w-full px-4 py-3 rounded-xl text-white text-sm
              ${errors.whatsapp ? 'border-rose-500/50 bg-rose-500/5' : ''}
            `}
            placeholder="https://chat.whatsapp.com/..."
          />
          {errors.whatsapp && <p className="text-rose-400 text-xs mt-1.5">{errors.whatsapp}</p>}
        </div>

        <div>
          <label className="block text-slate-300 text-sm mb-2 font-medium">
            <Link2 className="w-4 h-4 inline-block ml-1.5 text-slate-400" />
            رابط المجموعة <span className="text-slate-500 text-xs">(اختياري)</span>
          </label>
          <input
            type="url"
            value={groupLink}
            onChange={(e) => setGroupLink(e.target.value)}
            className="input-field w-full px-4 py-3 rounded-xl text-white text-sm"
            placeholder="https://teams.microsoft.com/..."
          />
        </div>

        {errors.submit && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm text-center">
            {errors.submit}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <PrimaryButton
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500"
          >
            {isSubmitting ? 'جاري الإنشاء...' : 'إنشاء المجموعة'}
          </PrimaryButton>

          <PrimaryButton
            type="button"
            onClick={() => window.location.href = '/dashboard/study-groups'}
            className="flex-1 bg-slate-700 hover:bg-slate-600 !text-white"
          >
            إلغاء
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
}