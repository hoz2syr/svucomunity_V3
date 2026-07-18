import React from 'react';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { cn } from '@/src/lib/utils';

interface AdminStatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color?: 'cyan' | 'blue' | 'emerald' | 'amber' | 'rose';
  isLoading?: boolean;
}

const colorClasses = {
  cyan: 'bg-cyan-500/10 text-cyan-400',
  blue: 'bg-blue-500/10 text-blue-400',
  emerald: 'bg-emerald-500/10 text-emerald-400',
  amber: 'bg-amber-500/10 text-amber-400',
  rose: 'bg-rose-500/10 text-rose-400',
};

export function AdminStatCard({ label, value, icon, color = 'cyan', isLoading }: AdminStatCardProps) {
  return (
    <GlassCard className="p-5">
      <div className="flex items-center gap-4">
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0', colorClasses[color])}>
          {icon}
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</span>
          {isLoading ? (
            <Skeleton className="w-16 h-8" />
          ) : (
            <span className="text-2xl font-black text-white">
              {typeof value === 'number' ? value.toLocaleString('ar-SA') : value}
            </span>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
