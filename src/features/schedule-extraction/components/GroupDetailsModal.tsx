"use client";

import { useState, useEffect } from "react";
import {
  BookOpen,
  Calendar,
  User,
  GraduationCap,
  MessageCircle,
  Link2,
  CheckCircle2,
} from "lucide-react";
import { ModalShell } from "./shared/ModalShell";
import { ProgressBar } from "./shared/ProgressBar";

interface GroupDetailsModalProps {
  isOpen: boolean;
  group: {
    id: string;
    name: string;
    course_code: string;
    course_name: string;
    major: string;
    class_number?: string | null;
    current_members: number;
    max_members: number;
    is_full: boolean;
    creator_name: string;
    creator_id?: string;
    whatsapp_link: string | null;
    group_link?: string | null;
  } | null;
  memberIds: string[];
  onJoin: () => void;
  onClose: () => void;
  isJoining: boolean;
  i18n?: {
    groupsMembers?: string;
    groupsFull?: string;
    groupsJoin?: string;
  };
}

export function GroupDetailsModal({
  isOpen,
  group,
  memberIds,
  onJoin,
  onClose,
  isJoining,
  i18n,
}: GroupDetailsModalProps) {
  const [showConfirmJoin, setShowConfirmJoin] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowConfirmJoin(false);
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      return () => window.removeEventListener("keydown", handleEsc);
    }
  }, [isOpen, onClose]);

  if (!isOpen || !group) return null;

  const isMember = memberIds.length > 0;
  const isFull = group.current_members >= group.max_members;

  const handleConfirmJoin = () => {
    setShowConfirmJoin(false);
    onJoin();
  };

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h2 className="text-lg font-bold text-white leading-snug">
              {group.name}
            </h2>
            <span className="inline-block mt-2 px-2.5 py-1 bg-teal-500/10 text-teal-400 rounded-lg text-xs font-mono border border-teal-500/20">
              {group.course_code}
            </span>
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center gap-3 text-sm text-slate-300">
            <BookOpen className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="truncate">{group.course_name}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-300">
            <GraduationCap className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="font-mono">{group.major}</span>
          </div>
          {group.class_number && (
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
              <span>
                {i18n?.groupsMembers || "الشعبة"}: {group.class_number}
              </span>
            </div>
          )}
          <div className="flex items-center gap-3 text-sm text-slate-300">
            <User className="w-4 h-4 text-slate-500 shrink-0" />
            <span>أنشأها: {group.creator_name}</span>
          </div>
        </div>

        <ProgressBar current={group.current_members} max={group.max_members} />

        <div className="space-y-2.5">
          {showConfirmJoin && !isMember && !isFull && (
            <div className="p-4 bg-teal-500/10 border border-teal-500/30 rounded-xl">
              <p className="text-teal-400 text-sm font-semibold text-center mb-3">
                هل تريد الانضمام لهذه المجموعة؟
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleConfirmJoin}
                  disabled={isJoining}
                  className="flex-1 py-2 bg-teal-600 hover:bg-teal-500 disabled:bg-teal-600/50 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  {isJoining ? "جاري الانضمام..." : "تأكيد"}
                </button>
                <button
                  onClick={() => setShowConfirmJoin(false)}
                  className="flex-1 py-2 bg-[var(--color-bg-elevated)] hover:bg-white/10 text-white rounded-lg transition-colors text-sm"
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}

          {!isMember && !isFull && !showConfirmJoin && (
            <button
              onClick={() => setShowConfirmJoin(true)}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition-colors font-medium text-sm"
            >
              {i18n?.groupsJoin || "انضمام"}
            </button>
          )}

          {isMember && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-center">
              <p className="text-emerald-400 text-sm font-medium flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                أنت عضو في هذه المجموعة
              </p>
            </div>
          )}

          {!isMember && isFull && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-center">
              <p className="text-rose-400 text-sm font-medium">
                {i18n?.groupsFull || "المجموعة ممتلئة"}
              </p>
            </div>
          )}

          {group.whatsapp_link && (
            <a
              href={group.whatsapp_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors font-medium text-sm"
            >
              <MessageCircle className="w-4 h-4" />
              افتح على الواتساب
            </a>
          )}

          {group.group_link && (
            <a
              href={group.group_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-[var(--color-bg-elevated)] hover:bg-white/10 text-white rounded-lg border border-white/10 transition-colors font-medium text-sm"
            >
              <Link2 className="w-4 h-4" />
              رابط المجموعة
            </a>
          )}
        </div>
      </div>
    </ModalShell>
  );
}
