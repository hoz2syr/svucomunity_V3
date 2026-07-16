'use client';

import { useState } from 'react';
import { FadeIn } from '../ui/FadeIn';
import { GlassCard } from '../ui/GlassCard';
import { Star, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePublicReviews } from '@/src/features/reviews';

export const ReviewsSection = () => {
  const { data: reviews, isLoading, error } = usePublicReviews();
  const [currentIndex, setCurrentIndex] = useState(0);

  if (isLoading) {
    return (
      <section className="py-24 px-4 border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">آراء المستخدمين</h2>
            <p className="text-xl text-slate-400 font-light">نعمل باستمرار على تحسين تجربتك</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <GlassCard key={i} className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <div key={s} className="w-5 h-5 bg-white/10 rounded-full" />
                    ))}
                  </div>
                  <div className="w-full h-16 bg-white/5 rounded-lg" />
                  <div className="w-24 h-3 bg-white/5 rounded-full" />
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || !reviews || reviews.length === 0) {
    return null;
  }

  const visibleReviews = reviews.slice(currentIndex, currentIndex + 3);
  const hasMore = currentIndex + 3 < reviews.length;
  const hasPrevious = currentIndex > 0;

  return (
    <section className="py-24 px-4 border-y border-white/5">
      <div className="max-w-5xl mx-auto">
        <FadeIn direction="down" className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-sm font-medium tracking-wide mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
            آراء المستخدمين
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">ماذا يقول طلابنا</h2>
          <p className="text-xl text-slate-400 font-light max-w-2xl mx-auto">نعمل باستمرار على تحسين تجربتك بناءً على ملاحظاتك</p>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {visibleReviews.map((review, idx) => (
            <FadeIn key={review.id} delay={idx * 100} direction="up" className="h-full">
              <GlassCard className="p-6 h-full flex flex-col">
                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      className={star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}
                    />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed flex-grow mb-4 line-clamp-4">
                  {review.comment}
                </p>
                {review.admin_response && (
                  <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-xl p-3 mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare size={12} className="text-cyan-400" />
                      <span className="text-xs text-cyan-400">رد الإدارة</span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">{review.admin_response}</p>
                  </div>
                )}
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <span className="text-xs text-slate-500">
                    {review.profiles?.full_name || review.profiles?.email || 'طالب'}
                  </span>
                  <time className="text-xs text-slate-500">
                    {new Date(review.created_at).toLocaleDateString('ar-SA')}
                  </time>
                </div>
              </GlassCard>
            </FadeIn>
          ))}
        </div>

        {reviews.length > 3 && (
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setCurrentIndex((p) => Math.max(0, p - 3))}
              disabled={!hasPrevious}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={20} />
            </button>
            <span className="text-sm text-slate-400">
              {Math.min(currentIndex + 3, reviews.length)} / {reviews.length}
            </span>
            <button
              onClick={() => setCurrentIndex((p) => p + 3)}
              disabled={!hasMore}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={20} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
