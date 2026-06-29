"use client";

import { useMemo } from "react";
import { Users } from "lucide-react";
import type { MatchedGroup } from "../types";
import { ProgressBar } from "./shared/ProgressBar";

interface ExtractedGroupCardProps {
  group: MatchedGroup;
  onClick: (groupId: string) => void;
}

export function ExtractedGroupCard({
  group,
  onClick,
}: ExtractedGroupCardProps) {
  const isFull = group.current_members >= group.max_members;
  const score = group.matchScore;

  const statusBadge = useMemo(() => {
    const base =
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border";
    if (isFull) {
      return `${base} bg-[var(--color-danger-light)] text-[var(--color-danger-400)] border-[var(--color-danger-border)]`;
    }
    return `${base} bg-[var(--color-success-light)] text-[var(--color-success-400)] border-[var(--color-success-border)]`;
  }, [isFull]);

  const scoreBadge = useMemo(() => {
    if (score == null) return null;
    if (score >= 100) {
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    }
    if (score >= 60) {
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    }
    return "bg-slate-500/10 text-slate-400 border-slate-500/20";
  }, [score]);

  const scoreLabel = useMemo(() => {
    if (score == null) return '';
    if (score >= 100) return 'تطابق كامل';
    if (score >= 60) return 'تطابق جزئي';
    return 'تطابق ضعيف';
  }, [score]);

  return (
    <button
      onClick={() => onClick(group.id)}
      className="group w-full text-right"
      type="button"
    >
      <div
        className="
          relative overflow-hidden
          bg-[var(--color-bg-card)] border border-[var(--color-border)]
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
            <span className={statusBadge}>
              <span className="leading-none">●</span>
              <span>{isFull ? "ممتلئة" : "متاحة"}</span>
            </span>
            <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 rounded-lg text-xs font-mono border border-indigo-500/20">
              {group.course_code}
            </span>
          </div>

          {scoreBadge && (
            <div className="mt-2">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${scoreBadge}`}>
                {scoreLabel} {score}%
              </span>
            </div>
          )}

          <h3 className="text-white font-semibold text-[15px] leading-snug line-clamp-2">
            {group.name}
          </h3>

          <p className="text-sm text-slate-400 truncate">{group.course_name}</p>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span>أنشأها: {group.creator_name}</span>
          </div>

          <ProgressBar
            current={group.current_members}
            max={group.max_members}
            size="sm"
          />
        </div>
      </div>
    </button>
  );
}
