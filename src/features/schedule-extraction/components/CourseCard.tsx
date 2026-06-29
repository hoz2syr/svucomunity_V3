"use client";

import { BookOpen, User, UserPlus } from "lucide-react";
import type { ExtractedCourse, MatchedGroup } from "../types";
import { ExtractedGroupCard } from "./ExtractedGroupCard";

interface CourseCardProps {
  course: ExtractedCourse;
  matchedGroups: MatchedGroup[];
  onOpenGroupDetails: (groupId: string) => void;
  onOpenCreateGroup: (course: ExtractedCourse) => void;
  i18n?: {
    scheduleCourse?: string;
    scheduleSection?: string;
    scheduleInstructor?: string;
    scheduleTime?: string;
    scheduleMatchedGroups?: string;
    scheduleNoMatchedGroups?: string;
    scheduleCreateGroup?: string;
    scheduleFull?: string;
    scheduleAvailable?: string;
  };
}

export function CourseCard({
  course,
  matchedGroups,
  onOpenGroupDetails,
  onOpenCreateGroup,
  i18n,
}: CourseCardProps) {
  const safeName = course.name || "";
  const safeCode = course.code || "";
  const safeSection = course.section || "";
  const safeInstructor = course.instructor || "";
  const groups = (matchedGroups || []).slice().sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));

  return (
    <div className="group relative bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-5 transition-all duration-150 hover:border-[var(--color-border-hover)] hover:shadow-[var(--shadow-card)]">
      <div className="relative space-y-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="space-y-1">
            <h3 className="text-white font-semibold text-[15px] leading-snug">
              {safeName}
            </h3>
            <span className="text-[var(--color-primary-400)] font-mono text-xs">
              {safeCode}
            </span>
          </div>
          {groups.length === 0 && (
            <button
              onClick={() => onOpenCreateGroup(course)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-primary-600)]/15 hover:bg-[var(--color-primary-600)]/25 text-[var(--color-primary-400)] rounded-lg text-xs font-medium transition-colors shrink-0"
              type="button"
            >
              <UserPlus className="w-3.5 h-3.5" />
               <span>{i18n?.scheduleCreateGroup || "إنشاء مجموعة"}</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-slate-400">
          {safeSection && (
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>
                {i18n?.scheduleSection || "الشعبة"}: {safeSection}
              </span>
            </span>
          )}
          {safeInstructor && (
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>
                {i18n?.scheduleInstructor || "الدكتور"}: {safeInstructor}
              </span>
            </span>
          )}
        </div>

        {groups.length > 0 ? (
          <div className="mt-4 pt-4 border-t border-white/[0.08] space-y-2.5">
            <p className="text-slate-400 text-sm">
              {i18n?.scheduleMatchedGroups || "المجموعات المطابقة"} (
              {groups.length})
            </p>
            <div className="grid gap-2.5">
              {groups.map((group) => (
                <ExtractedGroupCard
                  key={group.id}
                  group={group}
                  onClick={onOpenGroupDetails}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-4 pt-4 border-t border-white/[0.08]">
            <p className="text-slate-500 text-sm">
              {i18n?.scheduleNoMatchedGroups || "لا توجد مجموعات لهذه المادة"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
