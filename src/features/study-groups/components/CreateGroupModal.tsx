"use client";

import { useState, useEffect } from 'react';
import { Users, BookOpen, Calendar, GraduationCap, MessageCircle, Link2, Plus, Loader2 } from 'lucide-react';
import { Dropdown } from './Dropdown';
import type { Course } from '../src/types';
import { ModalShell } from './ModalShell';
import { PrimaryButton } from './PrimaryButton';
import { CLASSES } from '../src/constants';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    course_name: string;
    course_code: string;
    class_number: string;
    major: string;
    max_members: number;
    whatsapp_link: string;
    group_link?: string;
  }) => Promise<void>;
  currentUser: { major?: string; first_name?: string; last_name?: string; username?: string; id: string } | null;
  getCoursesByMajor: (major: string) => Promise<Course[]>;
  availableMajors: string[];
}

export function CreateGroupModal({
  isOpen,
  onClose,
  onSubmit,
  currentUser,
  getCoursesByMajor,
  availableMajors,
}: CreateGroupModalProps) {
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

  useEffect(() => {
    if (isOpen) {
      setGroupName('');
      setSelectedCourse(null);
      setSelectedClass('');
      setSelectedMajor('');
      setMaxMembers(5);
      setWhatsappLink('');
      setGroupLink('');
      setErrors({});
      setIsSubmitting(false);
      setCourses([]);

      if (currentUser?.major) {
        setSelectedMajor(currentUser.major);
        getCoursesByMajor(currentUser.major).then(setCourses);
      }
    }
  }, [isOpen, currentUser, getCoursesByMajor]);

  useEffect(() => {
    if (selectedMajor) {
      getCoursesByMajor(selectedMajor).then(setCourses);
    } else {
      setCourses([]);
    }
  }, [selectedMajor, getCoursesByMajor]);

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
    if (!validate() || !currentUser) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: groupName.trim(),
        course_name: selectedCourse!.name,
        course_code: selectedCourse!.code,
        class_number: selectedClass,
        major: selectedMajor,
        max_members: maxMembers,
        whatsapp_link: whatsappLink.trim(),
        group_link: groupLink.trim() || undefined,
      });
      onClose();
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'فشل إنشاء المجموعة' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const courseOptions = courses.map((c) => ({ value: c.code, label: c.name, sublabel: c.code }));
  const classOptions = CLASSES.map((c) => ({ value: c, label: c }));
  const majorOptions = availableMajors.map((m) => ({ value: m, label: m }));
  const submitButtonClassName = `
    w-full bg-gradient-to-r from-cyan-600 to-indigo-600
    hover:from-cyan-500 hover:to-indigo-500
  `;

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} maxWidth="max-w-lg" closeButton>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">إنشاء مجموعة جديدة</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
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

        <PrimaryButton
          type="submit"
          disabled={isSubmitting}
          className={submitButtonClassName}
          icon={isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
        >
          {isSubmitting ? 'جاري الإنشاء...' : 'إنشاء المجموعة'}
        </PrimaryButton>
      </form>
    </ModalShell>
  );
}
