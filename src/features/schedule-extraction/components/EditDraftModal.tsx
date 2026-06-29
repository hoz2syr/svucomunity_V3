"use client";

import { useState, useEffect } from "react";
import { ModalShell } from "./shared/ModalShell";
import type { DraftGroup } from "../types";

export interface EditDraftModalProps {
  isOpen: boolean;
  draft: DraftGroup | null;
  currentUserMajor: string | undefined;
  onClose: () => void;
  onSave: (data: {
    name: string;
    course_name: string;
    course_code: string;
    major: string;
    class_number: string | null;
    instructor: string | null;
    max_members: number;
    whatsapp_link: string;
  }) => void;
  isSaving: boolean;
}

export function EditDraftModal({
  isOpen,
  draft,
  currentUserMajor,
  onClose,
  onSave,
  isSaving,
}: EditDraftModalProps) {
  const [groupName, setGroupName] = useState("");
  const [major, setMajor] = useState(currentUserMajor || "");
  const [classNumber, setClassNumber] = useState("");
  const [instructor, setInstructor] = useState("");
  const [maxMembers, setMaxMembers] = useState("5");
  const [whatsappLink, setWhatsappLink] = useState("");
  const [majorsList] = useState<string[]>([
    "ITE (Information Technology Engineering)",
    "ENG (Engineering)",
    "BA (Business Administration)",
    "CS (Computer Science)",
  ]);

  useEffect(() => {
    if (isOpen && draft) {
      setGroupName(draft.name || `مجموعة مراجعة - ${draft.course_name}`);
      setMajor(draft.major || currentUserMajor || "");
      setClassNumber(draft.class_number || "");
      setInstructor(draft.instructor || "");
      setMaxMembers(String(draft.max_members || 5));
      setWhatsappLink(draft.whatsapp_link || "");
    }
  }, [isOpen, draft, currentUserMajor]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    onSave({
      name: groupName.trim(),
      course_name: draft.course_name,
      course_code: draft.course_code,
      major: major || currentUserMajor || "ITE (Information Technology Engineering)",
      class_number: classNumber.trim() || null,
      instructor: instructor.trim() || null,
      max_members: parseInt(maxMembers) || 5,
      whatsapp_link: whatsappLink.trim(),
    });
  };

  const fieldClassName =
    "w-full bg-[var(--color-bg-elevated)] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[var(--color-primary-500)] transition-colors";

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="mb-4 p-4 bg-white/5 rounded-xl border border-white/5">
          <p className="text-white font-medium text-sm">{draft?.course_name}</p>
          <p className="text-[var(--color-primary-400)] text-xs font-mono mt-1">
            {draft?.course_code}
          </p>
        </div>

        <div>
          <label className="block text-slate-300 text-sm mb-1.5">اسم المجموعة</label>
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
            value={instructor}
            onChange={(e) => setInstructor(e.target.value)}
            className={fieldClassName}
          />
        </div>

        <div>
          <label className="block text-slate-300 text-sm mb-1.5">
            رابط الواتساب (اختياري)
          </label>
          <input
            type="url"
            value={whatsappLink}
            onChange={(e) => setWhatsappLink(e.target.value)}
            className={fieldClassName}
            dir="ltr"
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
            disabled={isSaving}
            className="flex-1 py-2.5 px-4 bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] disabled:bg-[var(--color-primary-600)]/50 text-white rounded-xl transition-colors text-sm font-medium"
          >
            {isSaving ? "جاري الحفظ..." : "حفظ المسودة"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
