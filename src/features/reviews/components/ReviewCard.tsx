import { Star, MessageSquare } from 'lucide-react';
import type { Review } from '../types';

const categoryLabels: Record<string, string> = {
  ui: 'واجهة المستخدم',
  content: 'المحتوى',
  performance: 'الأداء',
  other: 'أخرى',
};

interface ReviewCardProps {
  review: Review;
  showUserInfo?: boolean;
  showResponse?: boolean;
}

export function ReviewCard({ review, showUserInfo = true, showResponse = true }: ReviewCardProps) {
  return (
     <div className="bg-stone-900/60 border border-amber-700/30 rounded-2xl p-4 space-y-2.5 shadow-[4px_4px_0px_0px_rgba(180,130,50,0.25)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={16}
              className={
                 star <= review.rating
                   ? 'fill-amber-600 text-amber-600'
                   : 'text-stone-600'
              }
            />
          ))}
          <span className="text-xs text-stone-400 mr-1">{review.rating}/5</span>
        </div>
        <span className="text-xs px-2.5 py-1 bg-white/5 rounded-lg text-slate-400">
          {categoryLabels[review.category] || review.category}
        </span>
      </div>

       <p className="text-sm text-stone-300 leading-relaxed whitespace-pre-wrap line-clamp-3">{review.comment}</p>

      {showResponse && review.admin_response && (
         <div className="bg-amber-900/10 border border-amber-700/20 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare size={14} className="text-cyan-400" />
             <span className="text-xs font-medium text-amber-600">رد الإدارة</span>
          </div>
           <p className="text-sm text-stone-300 leading-relaxed whitespace-pre-wrap line-clamp-3">{review.admin_response}</p>
        </div>
      )}

      {showUserInfo && (
         <div className="flex items-center justify-between pt-2 border-t border-white/5">
           <div className="text-xs text-stone-500 truncate max-w-[70%]">
             {review.profiles?.full_name || review.profiles?.email || 'مستخدم'}
           </div>
           <time className="text-xs text-stone-500">
            {new Date(review.created_at).toLocaleDateString('ar-SA')}
          </time>
        </div>
      )}
    </div>
  );
}
