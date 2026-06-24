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
        bg-white/[0.03] backdrop-blur-xl
        border border-white/[0.08]
        rounded-2xl p-5
        transition-all duration-300 ease-out
        hover:border-white/15
        hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.5)]
        hover:-translate-y-1
      ">
        {/* Subtle gradient overlay on hover */}
        <div className="
          absolute inset-0 opacity-0 group-hover:opacity-100
          bg-gradient-to-br from-cyan-500/[0.03] to-indigo-500/[0.03]
          transition-opacity duration-300
        " />

        <div className="relative">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <span className={`
              px-2.5 py-1 rounded-lg text-xs font-medium
              ${group.current_members >= group.max_members
                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
              }
            `}>
              {group.current_members >= group.max_members ? '● ممتلئة' : '● متاحة'}
            </span>
            <span className="px-2.5 py-1 bg-cyan-500/15 text-cyan-400 rounded-lg text-xs font-mono border border-cyan-500/20">
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
