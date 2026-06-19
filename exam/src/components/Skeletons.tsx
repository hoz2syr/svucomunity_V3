import { cn } from '../lib/utils';
import React from 'react';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-secondary-800/80", className)}
      {...props}
    />
  );
}

export function TestCardSkeleton() {
  return (
    <div className="glass-card p-6 flex flex-col h-full bg-secondary-900/40 border border-white/5">
      <Skeleton className="h-7 w-3/4 mb-4" />
      <div className="space-y-4 flex-grow mb-6">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-6 mt-auto">
        <div className="flex items-center gap-2">
           <Skeleton className="h-4 w-4 rounded-full" />
           <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex items-center gap-2">
           <Skeleton className="h-4 w-4 rounded-full" />
           <Skeleton className="h-4 w-20" />
        </div>
      </div>
      
      <div className="flex flex-col gap-2 border-t border-white/5 pt-5 mt-auto">
        <div className="flex gap-2">
            <Skeleton className="h-10 flex-1 rounded-xl" />
            <Skeleton className="h-10 flex-1 rounded-xl" />
        </div>
        <div className="flex gap-2">
            <Skeleton className="h-10 flex-[2] rounded-xl" />
            <Skeleton className="h-10 flex-1 rounded-xl bg-red-900/20" />
        </div>
      </div>
    </div>
  );
}

export function DashboardStatCardSkeleton() {
  return (
    <div className="glass-card p-6 flex items-center justify-between border border-white/5">
      <div className="space-y-3">
        <Skeleton className="h-4 w-24 bg-secondary-700/50" />
        <Skeleton className="h-8 w-16" />
      </div>
      <Skeleton className="h-12 w-12 rounded-2xl" />
    </div>
  );
}

export function PlayTestSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Skeleton className="h-6 w-24 mb-6" />
      <div className="flex justify-between px-2">
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="glass-card p-8 md:p-12 border border-white/5">
        <Skeleton className="h-8 w-full mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
        <div className="mt-8 flex justify-end border-t border-white/10 pt-6">
          <Skeleton className="h-12 w-36 rounded-xl bg-primary-900/30" />
        </div>
      </div>
    </div>
  );
}
