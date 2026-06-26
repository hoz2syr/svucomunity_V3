"use client";

import { BookOpen, GraduationCap } from 'lucide-react';
import type { StudyGroup } from '../src/types';
import { ProgressBar } from './ProgressBar';

interface GroupCardProps {
  group: StudyGroup;
  onClick: (groupId: string) => void;
}

export function GroupCard({ group, onClick }: GroupCardProps) {
  return (
    <button
      onClick={() => onClick(group.id)}
      className="w-full text-right group"
    >
      <div className="
         relative overflow-hidden
         bg-[var(--color-bg-card)] backdrop-blur-xl
         border border-[var(--color-glass-border)]
         rounded-2xl p-5
         transition-all duration-300 ease-out
         hover:border-[var(--color-glass-hover-border)]
         hover:shadow-[var(--shadow-glow-cyan)]
         hover:-translate-y-1
       ">
         {/* Subtle gradient overlay on hover */}
         <div className="
           absolute inset-0 opacity-0 group-hover:opacity-100
           bg-gradient-to-br from-[var(--color-primary-400)]/10 to-[var(--color-accent-purple)]/10
           transition-opacity duration-300
         " />

        <div className="relative">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <span className={`
              px-2.5 py-1 rounded-lg text-xs font-medium
              ${group.current_members >= group.max_members
                ? 'bg-[var(--color-danger-light)] text-[var(--color-danger-400)] border border-[var(--color-danger-border)]'
                : 'bg-[var(--color-success-light)] text-[var(--color-success-400)] border border-[var(--color-success-border)]'
              }
            `}>
              {group.current_members >= group.max_members ? '● ممتلئة' : '● متاحة'}
            </span>
            <span className="px-2.5 py-1 bg-[var(--color-info-light)] text-[var(--color-info-400)] rounded-lg text-xs font-mono border border-[var(--color-info-border)]">
              {group.course_code}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-white font-semibold mb-2 line-clamp-2 text-[15px] leading-snug">
            {group.name}
          </h3>

          {/* Info */}
          <div className="space-y-1.5 mb-4">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <BookOpen className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="truncate">{group.course_name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <GraduationCap className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="font-mono">{group.major}</span>
            </div>
          </div>

          <ProgressBar current={group.current_members} max={group.max_members} size="sm" />
        </div>
      </div>
    </button>
  );
}
