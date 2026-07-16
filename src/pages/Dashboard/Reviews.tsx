'use client';

import { useState } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { Icon } from '@/src/components/ui/Icon';
import { ReviewForm, ReviewsList } from '@/src/features/reviews';
import { useUserReviews } from '@/src/features/reviews';
import { Star, AlertTriangle, CheckCircle2, MessageSquare } from 'lucide-react';
import { cn } from '@/src/lib/utils';

type Tab = 'submit' | 'my-reviews';

export function ReviewsPage() {
  const { loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('submit');
  const { data: myReviews, isLoading: reviewsLoading, error: reviewsError } = useUserReviews();

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-cyan-400 text-lg">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-2 pt-4">
        <h1 className="text-3xl font-bold text-white tracking-tight">التقييمات</h1>
        <p className="text-slate-400 text-sm max-w-xl">شاركنا رأيك بالمنصة أو اطلع على تقييماتك السابقة</p>
      </div>

      <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('submit')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
            activeTab === 'submit'
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
              : 'text-slate-400 hover:text-white border border-transparent'
          )}
        >
          <Icon icon={Star} size="sm" />
          إضافة تقييم
        </button>
        <button
          onClick={() => setActiveTab('my-reviews')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
            activeTab === 'my-reviews'
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
              : 'text-slate-400 hover:text-white border border-transparent'
          )}
        >
          <Icon icon={MessageSquare} size="sm" />
          تقييماتي
          {myReviews && myReviews.length > 0 && (
            <span className="text-xs bg-white/10 px-2 py-0.5 rounded-lg">{myReviews.length}</span>
          )}
        </button>
      </div>

      {activeTab === 'submit' && (
        <ReviewForm onSuccess={() => setActiveTab('my-reviews')} />
      )}

      {activeTab === 'my-reviews' && (
        <div className="space-y-4">
          {reviewsLoading ? (
            <div className="grid gap-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <GlassCard key={i} className="p-5">
                  <Skeleton className="w-full h-24" />
                </GlassCard>
              ))}
            </div>
          ) : reviewsError ? (
            <GlassCard className="p-6 border-rose-500/30">
              <div className="flex items-center gap-2 text-rose-400">
                <Icon icon={AlertTriangle} size="sm" />
                <span className="text-sm">{reviewsError instanceof Error ? reviewsError.message : 'حدث خطأ'}</span>
              </div>
            </GlassCard>
          ) : myReviews && myReviews.length > 0 ? (
            <ReviewsList isAdmin={false} />
          ) : (
            <GlassCard className="p-8 text-center">
              <Icon icon={CheckCircle2} size="xl" className="text-slate-500 mb-3 mx-auto" />
              <p className="text-slate-400 text-sm">لم تقم بإضافة أي تقييم بعد</p>
            </GlassCard>
          )}
        </div>
      )}
    </div>
  );
}
