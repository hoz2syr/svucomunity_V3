"use client";

import { cn } from '../lib/utils';
import React from 'react';

interface SkeletonVariantProps extends React.ComponentProps<'div'> {
  shimmer?: boolean;
  variant?: 'default' | 'icon' | 'button' | 'card';
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonVariantProps>(
  ({ className, shimmer = true, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          shimmer && 'skeleton-shimmer',
          {
            default: 'animate-pulse rounded-md bg-muted',
            icon: 'animate-pulse rounded-full bg-muted',
            button: 'animate-pulse rounded-xl bg-muted',
            card: 'rounded-xl bg-muted border border-border',
          }[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

export function TestCardSkeleton() {
  return (
    <div className="glass-card flex flex-col h-full rounded-2xl overflow-hidden bg-secondary-900/50 border border-white/[0.06] skeleton-fade-in">
      <div className="flex-1 p-5 pb-4 space-y-3">
        <Skeleton className="h-6 w-4/5" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-28 rounded-lg" />
        </div>
      </div>

      <div className="flex flex-col gap-2 p-5 pt-2 border-t border-white/[0.06] bg-secondary-900/30">
        <Skeleton variant="button" className="h-10 w-full rounded-xl" />
        <div className="grid grid-cols-3 gap-2">
          <Skeleton variant="button" className="h-10 rounded-xl" />
          <Skeleton variant="button" className="h-10 rounded-xl" />
          <Skeleton variant="button" className="h-10 rounded-xl bg-red-900/20" />
        </div>
      </div>
    </div>
  );
}

export function PlayTestSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 skeleton-fade-in">
      <div className="flex justify-between px-2">
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="glass-card p-8 md:p-12 border border-white/5">
        <Skeleton className="h-8 w-full mb-8" />
        <div className="space-y-4">
          <Skeleton variant="button" className="h-16 w-full rounded-xl" />
          <Skeleton variant="button" className="h-16 w-full rounded-xl" />
          <Skeleton variant="button" className="h-16 w-full rounded-xl" />
          <Skeleton variant="button" className="h-16 w-full rounded-xl" />
        </div>
        <div className="mt-8 flex justify-end border-t border-white/10 pt-6">
          <Skeleton variant="button" className="h-12 w-36 rounded-xl bg-primary-900/30" />
        </div>
      </div>
    </div>
  );
}
