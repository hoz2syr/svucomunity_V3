'use client';

import { useState } from 'react';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { Button } from '@/src/components/ui/Button';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { Icon } from '@/src/components/ui/Icon';
import { ReviewCard } from './ReviewCard';
import { usePublicReviews, useAdminReviews } from '../hooks/useReviews';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { ReviewStatus, ReviewCategory } from '../types';

interface ReviewsListProps {
  isAdmin?: boolean;
  filters?: { status?: ReviewStatus; category?: ReviewCategory; search?: string };
}

export function ReviewsList({ isAdmin = false, filters }: ReviewsListProps) {
  const [page, setPage] = useState(1);
  const limit = 20;

  const publicQuery = usePublicReviews();
  const adminQuery = useAdminReviews(page, limit, filters);

  const { data: publicReviews, isLoading: publicLoading, error: publicError } = publicQuery;
  const { data: adminReviews, isLoading: adminLoading, error: adminError } = adminQuery;

  const reviews = isAdmin ? adminReviews : publicReviews;
  const isLoading = isAdmin ? adminLoading : publicLoading;
  const error = isAdmin ? adminError : publicError;

  if (isLoading) {
    return (
      <div className="grid gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <GlassCard key={i} className="p-5">
            <Skeleton className="w-full h-24" />
          </GlassCard>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <GlassCard className="p-6 border-rose-500/30">
        <div className="flex items-center gap-2 text-rose-400">
          <Icon icon={AlertTriangle} size="sm" />
          <span className="text-sm">{error instanceof Error ? error.message : 'حدث خطأ'}</span>
        </div>
      </GlassCard>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <GlassCard className="p-8 text-center">
        <Icon icon={CheckCircle2} size="xl" className="text-slate-500 mb-3 mx-auto" />
        <p className="text-slate-400 text-sm">لا يوجد تقييمات</p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewCard
          key={review.id}
          review={review}
          showUserInfo={isAdmin}
          showResponse={true}
        />
      ))}

      {isAdmin && (
        <div className="flex items-center justify-between">
          <Button
            variant="secondary"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            السابق
          </Button>
          <span className="text-sm text-slate-400">صفحة {page}</span>
          <Button
            variant="secondary"
            onClick={() => setPage((p) => p + 1)}
            disabled={reviews.length < limit}
          >
            التالي
          </Button>
        </div>
      )}
    </div>
  );
}
