"use client";

import { useState, useEffect } from "react";
import { ModalShell } from "./shared/ModalShell";

interface CreateGroupModalProps {
  isOpen: boolean;
  courseCode: string | null;
  courseName: string | null;
  currentUserMajor: string | undefined;
  onClose: () => void;
  onCreate: (data: {
    name: string;
    course_name: string;
    course_code: string;
    class_number: string | null;
    doctor_name: string | null;
    major: string;
    max_members: number;
    whatsapp_link: string;
  }) => void;
  isCreating: boolean;
}

export function CreateGroupModal({
  isOpen,
  courseCode,
  courseName,
  currentUserMajor,
  onClose,
  onCreate,
  isCreating,
}: CreateGroupModalProps) {
  const [groupName, setGroupName] = useState("");
  const [major, setMajor] = useState(currentUserMajor || "");
  const [classNumber, setClassNumber] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [maxMembers, setMaxMembers] = useState("5");
  const [whatsappLink, setWhatsappLink] = useState("");
  const [majorsList] = useState<string[]>([
    "ITE (Information Technology Engineering)",
    "ENG (Engineering)",
    "BA (Business Administration)",
    "CS (Computer Science)",
  ]);

  useEffect(() => {
    if (isOpen && courseName) {
      setGroupName(`مجموعة مراجعة - ${courseName}`);
      setClassNumber("");
      setMajor(currentUserMajor || "");
      setDoctorName("");
      setWhatsappLink("");
    }
  }, [isOpen, courseName, currentUserMajor]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseCode || !courseName) return;
    onCreate({
      name: groupName.trim(),
      course_name: courseName,
      course_code: courseCode.toUpperCase(),
      class_number: classNumber.trim() || null,
      doctor_name: doctorName.trim() || null,
      major: major || currentUserMajor || "ITE (Information Technology Engineering)",
      max_members: parseInt(maxMembers) || 5,
      whatsapp_link: whatsappLink.trim(),
    });
  };

  const fieldClassName =
    "w-full bg-[var(--color-bg-elevated)] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[var(--color-primary-500)] transition-colors";

  if (!isOpen || !courseCode || !courseName) return null;

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="mb-5 p-4 bg-white/5 rounded-xl border border-white/5">
          <p className="text-white font-medium text-sm">{courseName}</p>
          <p className="text-[var(--color-primary-400)] text-xs font-mono mt-1">
            {courseCode}
          </p>
        </div>

        <div>
          <label className="block text-slate-300 text-sm mb-1.5">
            اسم المجموعة
          </label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className={fieldClassName}
            required
          />
        </div>

        <div>
          <label className="block text-slate-300 text-sm mb-1.5">التخصص</label>
          <select
            value={major}
            onChange={(e) => setMajor(e.target.value)}
            className={fieldClassName}
          >
            {majorsList.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-300 text-sm mb-1.5">
              رقم الشعبة
            </label>
            <input
              type="text"
              value={classNumber}
              onChange={(e) => setClassNumber(e.target.value)}
              className={fieldClassName}
            />
          </div>
          <div>
            <label className="block text-slate-300 text-sm mb-1.5">
              أقصى عدد أعضاء
            </label>
            <input
              type="number"
              min={2}
              max={50}
              value={maxMembers}
              onChange={(e) => setMaxMembers(e.target.value)}
              className={fieldClassName}
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-300 text-sm mb-1.5">
            اسم الدكتور (اختياري)
          </label>
          <input
            type="text"
            value={doctorName}
            onChange={(e) => setDoctorName(e.target.value)}
            className={fieldClassName}
          />
        </div>

        <div>
          <label className="block text-slate-300 text-sm mb-1.5">
            رابط الواتساب
          </label>
          <input
            type="url"
            value={whatsappLink}
            onChange={(e) => setWhatsappLink(e.target.value)}
            placeholder="https://chat.whatsapp.com/..."
            className={fieldClassName}
          />
        </div>

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 bg-[var(--color-bg-elevated)] hover:bg-white/10 text-white rounded-xl transition-colors text-sm font-medium"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={isCreating}
            className="flex-1 py-2.5 px-4 bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] disabled:bg-[var(--color-primary-600)]/50 text-white rounded-xl transition-colors text-sm font-medium"
          >
            {isCreating ? "جاري الإنشاء..." : "إنشاء المجموعة"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
