import { useState, useEffect } from 'react';
import { useCreateReview } from '@/src/features/reviews';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { Button } from '@/src/components/ui/Button';
import { InputField } from '@/src/components/ui/InputField';
import { Icon } from '@/src/components/ui/Icon';
import { Star, Send, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { ReviewCategory } from '@/src/features/reviews/types';

type MajorSupportSectionProps = {
  userMajor: string | null;
  isGuest: boolean;
};

export function MajorSupportSection({ userMajor, isGuest }: MajorSupportSectionProps) {
  const [major, setMajor] = useState(userMajor || '');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const mutation = useCreateReview();

  useEffect(() => {
    if (userMajor) {
      setMajor(userMajor);
      setComment(`يرجى منكم دعم التخصص ${userMajor} باسرع وقت`);
    }
  }, [userMajor]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || comment.trim().length === 0 || !major.trim()) return;

    mutation.mutate(
      { rating, category: 'major_support' as ReviewCategory, comment: comment.trim() },
      {
        onSuccess: () => {
          setRating(0);
          setComment('');
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <GlassCard className="p-6 border-amber-500/20">
        <div className="flex items-start gap-3 mb-4">
          <Icon icon={AlertTriangle} size="lg" className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h2 className="text-xl font-bold text-white mb-2">نعتذر، التخصص الحالي غير مدعوم في المنصة</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              نحن نعمل حالياً على إضافة المزيد من التخصصات. يمكنك إرسال طلب دعم تخصصك وسيتم إعلامك عند توفره.
            </p>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h3 className="text-lg font-bold text-white mb-4">أرسل طلب دعم تخصص</h3>
        <form onSubmit={handleSubmit} className="space-y-5">
          {isGuest && (
            <InputField
              label="التخصص"
              value={major}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMajor(e.target.value)}
              placeholder="أدخل اسم التخصص..."
              required
            />
          )}

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
            <label className="block text-sm text-slate-400 mb-2">الرسالة</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
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
              تم إرسال طلبك بنجاح. سنقوم بإعلامك عند توفير التخصص.
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            isLoading={mutation.isPending}
            loadingText="جاري الإرسال..."
            icon={<Icon icon={Send} size="xs" />}
            disabled={rating === 0 || comment.trim().length === 0 || (isGuest && !major.trim())}
            className="w-full"
          >
            إرسال الطلب
          </Button>
        </form>
      </GlassCard>
    </div>
  );
}
