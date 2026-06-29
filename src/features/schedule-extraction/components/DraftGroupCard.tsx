"use client";

import { GraduationCap, Calendar, User } from "lucide-react";
import type { DraftGroup } from "../types";

interface DraftGroupCardProps {
  draft: DraftGroup;
  onEdit: (draft: DraftGroup) => void;
}

export function DraftGroupCard({ draft, onEdit }: DraftGroupCardProps) {
  return (
    <button
      onClick={() => onEdit(draft)}
      className="group w-full text-right"
      type="button"
    >
      <div
        className="
          relative overflow-hidden
          bg-[var(--color-bg-card)] border border-white/8
          rounded-2xl p-5
          transition-all duration-150
          hover:border-[var(--color-border-hover)]
          hover:shadow-[var(--shadow-card)]
          hover:-translate-y-1
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-primary)]
        "
      >
        <div
          className="
            absolute inset-0 opacity-0 group-hover:opacity-100
            bg-gradient-to-br from-indigo-500/5 to-cyan-500/5
            transition-opacity duration-150 pointer-events-none
          "
        />

        <div className="relative space-y-3">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
              مسودة
            </span>
            <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 rounded-lg text-xs font-mono border border-indigo-500/20">
              {draft.course_code}
            </span>
          </div>

          <h3 className="text-white font-semibold text-[15px] leading-snug line-clamp-2">
            {draft.name}
          </h3>

          <p className="text-sm text-slate-400 truncate">{draft.course_name}</p>

          <div className="space-y-1.5">
            {draft.class_number && (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
                <span>الشعبة: {draft.class_number}</span>
              </div>
            )}
            {draft.instructor && (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <User className="w-4 h-4 text-slate-500 shrink-0" />
                <span>الدكتور: {draft.instructor}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <GraduationCap className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="font-mono">{draft.major}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-white/5">
            <p className="text-xs text-slate-500">أقصى عدد أعضاء: {draft.max_members}</p>
          </div>
        </div>
      </div>
    </button>
  );
}
