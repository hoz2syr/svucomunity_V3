'use client';

import { useState } from 'react';
import { useCreateReview } from '@/src/features/reviews';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { Button } from '@/src/components/ui/Button';
import { Icon } from '@/src/components/ui/Icon';
import { Dropdown } from '@/src/components/ui/Dropdown';
import { Star, Send, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { ReviewCategory } from '@/src/features/reviews/types';

const categories: { value: ReviewCategory; label: string }[] = [
  { value: 'ui', label: 'واجهة المستخدم' },
  { value: 'content', label: 'المحتوى' },
  { value: 'performance', label: 'الأداء' },
  { value: 'other', label: 'أخرى' },
];

export function ReviewForm({ onSuccess }: { onSuccess?: () => void }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [category, setCategory] = useState<ReviewCategory>('other');
  const [comment, setComment] = useState('');
  const mutation = useCreateReview();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || comment.trim().length === 0) return;

    mutation.mutate(
      { rating, category, comment: comment.trim() },
      {
        onSuccess: () => {
          setRating(0);
          setCategory('other');
          setComment('');
          onSuccess?.();
        },
      }
    );
  };

  return (
    <GlassCard className="p-6">
      <h2 className="text-xl font-bold text-white mb-4">إضافة تقييم جديد</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm text-slate-400 mb-2">التقييم</label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  size={28}
                  className={
                    star <= (hoverRating || rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-600'
                  }
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="mr-2 text-sm text-slate-400">{rating}/5</span>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-2">التصنيف</label>
          <Dropdown
            value={category}
            onChange={(value) => setCategory(value as ReviewCategory)}
            options={categories.map((cat) => ({ value: cat.value, label: cat.label }))}
            placeholder="اختر التصنيف"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-2">الملاحظات</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="شاركنا رأيك بالمنصة..."
            rows={4}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 resize-none"
          />
        </div>

        {mutation.isError && (
          <div className="flex items-center gap-2 text-rose-400 text-sm">
            <Icon icon={AlertTriangle} size="sm" />
            {mutation.error instanceof Error ? mutation.error.message : 'حدث خطأ'}
          </div>
        )}

        {mutation.isSuccess && (
          <div className="flex items-center gap-2 text-emerald-400 text-sm">
            <Icon icon={CheckCircle2} size="sm" />
            تم إرسال التقييم بنجاح
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          isLoading={mutation.isPending}
          loadingText="جاري الإرسال..."
          icon={<Icon icon={Send} size="xs" />}
          disabled={rating === 0 || comment.trim().length === 0}
          className="w-full"
        >
          إرسال التقييم
        </Button>
      </form>
    </GlassCard>
  );
}
