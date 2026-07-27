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
     <div className="max-w-4xl mx-auto space-y-5">
       <div className="space-y-1.5 pt-3">
         <h1 className="text-2xl font-bold text-stone-100 tracking-tight">التقييمات</h1>
         <p className="text-stone-400 text-sm max-w-xl">شاركنا رأيك بالمنصة أو اطلع على تقييماتك السابقة</p>
       </div>

      <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('submit')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
             activeTab === 'submit'
               ? 'bg-amber-600/10 text-amber-600 border border-amber-600/20'
               : 'text-stone-400 hover:text-stone-100 border border-transparent'
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
               ? 'bg-amber-600/10 text-amber-600 border border-amber-600/20'
               : 'text-stone-400 hover:text-stone-100 border border-transparent'
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
            <div className="grid gap-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <GlassCard key={i} className="p-4 border-amber-700/30 shadow-[4px_4px_0px_0px_rgba(180,130,50,0.25)]">
                  <Skeleton className="w-full h-24" />
                </GlassCard>
              ))}
            </div>
          ) : reviewsError ? (
            <GlassCard className="p-4 border-rose-500/30">
              <div className="flex items-center gap-2 text-rose-400">
                <Icon icon={AlertTriangle} size="sm" />
                <span className="text-sm">{reviewsError instanceof Error ? reviewsError.message : 'حدث خطأ'}</span>
              </div>
            </GlassCard>
          ) : myReviews && myReviews.length > 0 ? (
            <ReviewsList isAdmin={false} />
          ) : (
            <GlassCard className="p-6 text-center border-amber-700/30 shadow-[4px_4px_0px_0px_rgba(180,130,50,0.25)]">
              <Icon icon={CheckCircle2} size="xl" className="text-stone-500 mb-3 mx-auto" />
              <p className="text-stone-400 text-sm">لم تقم بإضافة أي تقييم بعد</p>
            </GlassCard>
          )}
        </div>
      )}
    </div>
  );
}
