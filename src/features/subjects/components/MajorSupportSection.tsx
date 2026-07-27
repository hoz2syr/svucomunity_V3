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
     <div className="space-y-5">
       <GlassCard className="p-4 border-amber-700/30 shadow-[4px_4px_0px_0px_rgba(180,130,50,0.25)]">
         <div className="flex items-start gap-3 mb-3">
           <Icon icon={AlertTriangle} size="lg" className="text-amber-600 shrink-0 mt-0.5" />
           <div>
             <h2 className="text-lg font-bold text-stone-100 mb-1.5">نعتذر، التخصص الحالي غير مدعوم في المنصة</h2>
             <p className="text-sm text-stone-300 leading-relaxed">
               نحن نعمل حالياً على إضافة المزيد من التخصصات. يمكنك إرسال طلب دعم تخصصك وسيتم إعلامك عند توفره.
             </p>
           </div>
         </div>
       </GlassCard>

       <GlassCard className="p-4 border-amber-700/30 shadow-[4px_4px_0px_0px_rgba(180,130,50,0.25)]">
         <h3 className="text-base font-bold text-stone-100 mb-3">أرسل طلب دعم تخصص</h3>
         <form onSubmit={handleSubmit} className="space-y-3">
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
            <label className="block text-sm text-stone-400 mb-1.5">التقييم</label>
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
                        ? 'fill-amber-600 text-amber-600'
                        : 'text-stone-600'
                    }
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="mr-2 text-sm text-stone-400">{rating}/5</span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm text-stone-400 mb-1.5">الرسالة</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-600/50 resize-none"
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
