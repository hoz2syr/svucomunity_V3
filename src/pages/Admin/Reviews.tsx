'use client';

import { useState } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { Button } from '@/src/components/ui/Button';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { Icon } from '@/src/components/ui/Icon';
import {
  useAdminReviews,
  useRespondToReview,
  useReviewStats,
} from '../../features/reviews';
import {
  Star,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Send,
  X,
  Inbox,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import type { Review } from '@/src/features/reviews/types';

type StatusFilter = 'all' | 'pending' | 'reviewed' | 'responded';
type CategoryFilter = 'all' | 'ui' | 'content' | 'performance' | 'other' | 'major_support';

const STATUS_OPTIONS: StatusFilter[] = ['all', 'pending', 'reviewed', 'responded'];
const CATEGORY_OPTIONS: CategoryFilter[] = ['all', 'ui', 'content', 'performance', 'other', 'major_support'];

const isStatusFilter = (value: string): value is StatusFilter => {
  return STATUS_OPTIONS.some(option => option === value);
};

const isCategoryFilter = (value: string): value is CategoryFilter => {
  return CATEGORY_OPTIONS.some(option => option === value);
};

const STATUS_LABELS: Record<StatusFilter, string> = {
  all: 'الكل',
  pending: 'قيد المراجعة',
  reviewed: 'تمت المراجعة',
  responded: 'تم الرد',
};

const CATEGORY_LABELS: Record<CategoryFilter, string> = {
  all: 'الكل',
  ui: 'واجهة المستخدم',
  content: 'المحتوى',
  performance: 'الأداء',
  other: 'أخرى',
  major_support: 'دعم تخصص',
};

export function Reviews() {
  const { profile, loading: authLoading } = useAuth();
  const isAdmin = profile?.role === 'admin';

  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [responseText, setResponseText] = useState('');
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);

  const limit = 20;

  const { data: reviews, isLoading: reviewsLoading, error: reviewsError, refetch } = useAdminReviews(page, limit, {
    status: statusFilter === 'all' ? undefined : statusFilter,
    category: categoryFilter === 'all' ? undefined : categoryFilter,
    search: searchQuery || undefined,
  });

  const { data: stats } = useReviewStats();
  const respondMutation = useRespondToReview();

  const openResponseModal = (review: Review) => {
    setSelectedReview(review);
    setResponseText('');
    setIsResponseModalOpen(true);
  };

  const handleRespond = () => {
    if (!selectedReview || responseText.trim().length === 0) return;

    respondMutation.mutate(
      { reviewId: selectedReview.id, response: responseText.trim() },
      {
        onSuccess: () => {
          setIsResponseModalOpen(false);
          setSelectedReview(null);
          setResponseText('');
        },
      }
    );
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-cyan-400 text-lg">جاري التحميل...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <GlassCard className="p-8 text-center max-w-md">
          <Icon icon={AlertTriangle} size="xl" className="text-rose-400 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">غير مصرح</h2>
          <p className="text-slate-400 text-sm">ليس لديك صلاحية الوصول لهذه الصفحة</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 pt-4">
        <h1 className="text-3xl font-bold text-white tracking-tight">التقييمات</h1>
        <p className="text-slate-400 text-sm max-w-xl">إدارة تقييمات المستخدمين والرد عليها</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <Icon icon={Star} size="sm" className="text-cyan-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
                <p className="text-xs text-slate-400">إجمالي التقييمات</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Icon icon={Inbox} size="sm" className="text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.pending}</p>
                <p className="text-xs text-slate-400">قيد المراجعة</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Icon icon={CheckCircle2} size="sm" className="text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.responded}</p>
                <p className="text-xs text-slate-400">تم الرد</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Icon icon={Star} size="sm" className="text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.avgRating}</p>
                <p className="text-xs text-slate-400">متوسط التقييم</p>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Icon icon={Search} size="sm" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="بحث في التقييمات..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="w-full pr-10 pl-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(isStatusFilter(e.target.value) ? e.target.value : 'all'); setPage(1); }}
          className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500/50"
        >
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(isCategoryFilter(e.target.value) ? e.target.value : 'all'); setPage(1); }}
          className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500/50"
        >
          {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <Button
          variant="secondary"
          onClick={() => refetch()}
          icon={<Icon icon={RefreshCw} size="xs" />}
        >
          تحديث
        </Button>
      </div>

      {reviewsError && (
        <GlassCard className="p-4 border-rose-500/30">
          <div className="flex items-center gap-2 text-rose-400">
            <Icon icon={AlertTriangle} size="sm" />
            <span className="text-sm">{reviewsError instanceof Error ? reviewsError.message : 'حدث خطأ'}</span>
          </div>
        </GlassCard>
      )}

      {reviewsLoading ? (
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <GlassCard key={i} className="p-5">
              <Skeleton className="w-full h-24" />
            </GlassCard>
          ))}
        </div>
      ) : reviews && reviews.length > 0 ? (
        <div className="grid gap-4">
          {reviews.map((review) => (
            <GlassCard key={review.id} className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        className={star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}
                      />
                    ))}
                    <span className="text-xs text-slate-400 mr-1">{review.rating}/5</span>
                    <span className="text-xs px-2.5 py-1 bg-white/5 rounded-lg text-slate-400">
                      {isCategoryFilter(review.category) ? CATEGORY_LABELS[review.category] : review.category}
                    </span>
                    <span className={cn(
                      'text-xs px-2.5 py-1 rounded-lg',
                      review.status === 'pending' && 'bg-amber-500/10 text-amber-400',
                      review.status === 'reviewed' && 'bg-blue-500/10 text-blue-400',
                      review.status === 'responded' && 'bg-emerald-500/10 text-emerald-400',
                    )}>
                      {isStatusFilter(review.status) ? STATUS_LABELS[review.status] : review.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed mb-3">{review.comment}</p>
                  {review.admin_response && (
                    <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-xl p-3 mb-3">
                      <p className="text-xs text-cyan-400 mb-1">رد الإدارة:</p>
                      <p className="text-sm text-slate-300">{review.admin_response}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>{review.profiles?.full_name || review.profiles?.email || review.user_id}</span>
                    <span>|</span>
                    <time>{new Date(review.created_at).toLocaleString('ar-SA')}</time>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {review.status !== 'responded' && (
                    <Button
                      variant="secondary"
                      onClick={() => openResponseModal(review)}
                      disabled={respondMutation.isPending}
                    >
                      رد
                    </Button>
                  )}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <GlassCard className="p-8 text-center">
          <Icon icon={CheckCircle2} size="xl" className="text-slate-500 mb-3 mx-auto" />
          <p className="text-slate-400 text-sm">لا يوجد تقييمات</p>
        </GlassCard>
      )}

      {reviews && reviews.length > 0 && (
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

      {isResponseModalOpen && selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsResponseModalOpen(false)} />
          <GlassCard className="relative z-10 w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">الرد على التقييم</h2>
              <button onClick={() => setIsResponseModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-sm text-slate-300 mb-2">{selectedReview.comment}</p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={14}
                      className={star <= selectedReview.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">الرد</label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="اكتب ردك هنا..."
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 resize-none"
                />
              </div>
              {respondMutation.isError && (
                <div className="flex items-center gap-2 text-rose-400 text-sm">
                  <Icon icon={AlertTriangle} size="sm" />
                  {respondMutation.error instanceof Error ? respondMutation.error.message : 'حدث خطأ'}
                </div>
              )}
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setIsResponseModalOpen(false)}
                  disabled={respondMutation.isPending}
                  className="flex-1"
                >
                  إلغاء
                </Button>
                <Button
                  variant="primary"
                  onClick={handleRespond}
                  disabled={responseText.trim().length === 0}
                  isLoading={respondMutation.isPending}
                  loadingText="جاري الإرسال..."
                  icon={<Icon icon={Send} size="xs" />}
                  className="flex-1"
                >
                  إرسال الرد
                </Button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
