'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { Button } from '@/src/components/ui/Button';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { Icon } from '@/src/components/ui/Icon';
import {
  useAdminNotifications,
  useCreateAdminNotification,
  useBroadcastNotification,
  useDeleteAdminNotification,
  useMarkNotificationAsReadAdmin,
  useNotificationStats,
} from '../../features/admin/hooks/useAdminNotifications';
import {
  Bell,
  Send,
  Trash2,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  X,
  Users,
  MessageSquare,
  ArrowUpRight,
  Inbox,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import type { AdminNotification } from '../../features/admin/services/adminNotificationService.supabase';

type PriorityOption = 'low' | 'normal' | 'high' | 'urgent';
type TypeFilter = 'all' | 'user' | 'admin_broadcast' | 'system';
type ReadFilter = 'all' | 'read' | 'unread';

const PRIORITY_OPTIONS: PriorityOption[] = ['low', 'normal', 'high', 'urgent'];
const TYPE_OPTIONS: TypeFilter[] = ['all', 'user', 'admin_broadcast', 'system'];
const READ_OPTIONS: ReadFilter[] = ['all', 'read', 'unread'];

const isPriorityOption = (value: string): value is PriorityOption => {
  return PRIORITY_OPTIONS.some(option => option === value);
};

const isTypeFilter = (value: string): value is TypeFilter => {
  return TYPE_OPTIONS.some(option => option === value);
};

const isReadFilter = (value: string): value is ReadFilter => {
  return READ_OPTIONS.some(option => option === value);
};

const PRIORITY_LABELS: Record<PriorityOption, string> = {
  low: 'منخفضة',
  normal: 'عادية',
  high: 'عالية',
  urgent: 'عاجلة',
};

const TYPE_LABELS: Record<string, string> = {
  user: 'مستخدم',
  admin_broadcast: 'إذاعة إدارية',
  system: 'نظام',
};

export function NotificationManagement() {
  const { profile, loading: authLoading } = useAuth();
  const isAdmin = profile?.role === 'admin';

  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityOption | 'all'>('all');
  const [readFilter, setReadFilter] = useState<ReadFilter>('all');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<AdminNotification | null>(null);

  const limit = 20;

  const { data: notifications, isLoading: notificationsLoading, error: notificationsError, refetch } = useAdminNotifications(page, limit, {
    type: typeFilter === 'all' ? undefined : typeFilter,
    priority: priorityFilter === 'all' ? undefined : priorityFilter,
    read: readFilter === 'all' ? undefined : readFilter === 'read',
    search: searchQuery || undefined,
  });

  const { data: stats } = useNotificationStats();
  const createMutation = useCreateAdminNotification();
  const broadcastMutation = useBroadcastNotification();
  const deleteMutation = useDeleteAdminNotification();
  const markReadMutation = useMarkNotificationAsReadAdmin();

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (typeFilter !== 'all') count++;
    if (priorityFilter !== 'all') count++;
    if (readFilter !== 'all') count++;
    if (searchQuery) count++;
    return count;
  }, [typeFilter, priorityFilter, readFilter, searchQuery]);

  const clearFilters = () => {
    setTypeFilter('all');
    setPriorityFilter('all');
    setReadFilter('all');
    setSearchQuery('');
    setPage(1);
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
          <Icon icon={Bell} size="xl" className="text-rose-400 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">غير مصرح</h2>
          <p className="text-slate-400 text-sm">ليس لديك صلاحية الوصول لهذه الصفحة</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 pt-4">
        <h1 className="text-3xl font-bold text-white tracking-tight">إدارة الإشعارات</h1>
        <p className="text-slate-400 text-sm max-w-xl">
          إنشاء وإدارة إشعارات المستخدمين وبث إعلانات للمنصة
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
              <Icon icon={Bell} size="sm" className="text-cyan-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats?.total ?? '-'}</p>
              <p className="text-xs text-slate-400">إجمالي الإشعارات</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Icon icon={Inbox} size="sm" className="text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats?.unread ?? '-'}</p>
              <p className="text-xs text-slate-400">غير مقروءة</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Icon icon={Send} size="sm" className="text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats?.broadcasts ?? '-'}</p>
              <p className="text-xs text-slate-400">إذاعات إدارية</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Icon icon={Users} size="sm" className="text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats?.userNotifications ?? '-'}</p>
              <p className="text-xs text-slate-400">إشعارات المستخدمين</p>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Icon icon={Search} size="sm" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="بحث بالعنوان أو المحتوى..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="w-full pr-10 pl-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(isTypeFilter(e.target.value) ? e.target.value : 'all'); setPage(1); }}
          className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500/50"
        >
          <option value="all">كل الأنواع</option>
          <option value="user">مستخدم</option>
          <option value="admin_broadcast">إذاعة إدارية</option>
          <option value="system">نظام</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => { setPriorityFilter(isPriorityOption(e.target.value) ? e.target.value : 'all'); setPage(1); }}
          className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500/50"
        >
          <option value="all">كل الأولويات</option>
          <option value="low">منخفضة</option>
          <option value="normal">عادية</option>
          <option value="high">عالية</option>
          <option value="urgent">عاجلة</option>
        </select>
        <select
          value={readFilter}
          onChange={(e) => { setReadFilter(isReadFilter(e.target.value) ? e.target.value : 'all'); setPage(1); }}
          className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500/50"
        >
          <option value="all">الكل</option>
          <option value="unread">غير مقروءة</option>
          <option value="read">مقروءة</option>
        </select>
        <Button
          variant="secondary"
          onClick={() => refetch()}
          icon={<Icon icon={RefreshCw} size="xs" />}
        >
          تحديث
        </Button>
      </div>

      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">فلاتر نشطة ({activeFiltersCount})</span>
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
          >
            مسح الفلاتر
          </button>
        </div>
      )}

      <div className="flex gap-3">
        <Button
          variant="primary"
          onClick={() => setShowCreateModal(true)}
          icon={<Icon icon={MessageSquare} size="xs" />}
        >
          إنشاء إشعار
        </Button>
        <Button
          variant="secondary"
          onClick={() => setShowBroadcastModal(true)}
          icon={<Icon icon={Send} size="xs" />}
        >
          بث للجميع
        </Button>
      </div>

      {notificationsError && (
        <GlassCard className="p-4 border-rose-500/30">
          <div className="flex items-center gap-2 text-rose-400">
            <Icon icon={AlertTriangle} size="sm" />
            <span className="text-sm">{notificationsError instanceof Error ? notificationsError.message : 'حدث خطأ'}</span>
          </div>
        </GlassCard>
      )}

      {notificationsLoading ? (
        <div className="grid gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <GlassCard key={i} className="p-5">
              <Skeleton className="w-full h-16" />
            </GlassCard>
          ))}
        </div>
      ) : notifications && notifications.length > 0 ? (
        <div className="grid gap-4">
          {notifications.map((notification: AdminNotification) => (
            <GlassCard
              key={notification.id}
              className={cn(
                'p-5 transition-all',
                !notification.read && 'border-cyan-500/20',
              )}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-white font-medium truncate">{notification.title}</h3>
                    <span
                      className={cn(
                        'text-[10px] px-2 py-0.5 rounded-lg font-bold',
                        notification.type === 'admin_broadcast'
                          ? 'bg-blue-500/10 text-blue-400'
                          : notification.type === 'system'
                          ? 'bg-purple-500/10 text-purple-400'
                          : 'bg-white/5 text-slate-400',
                      )}
                    >
                      {TYPE_LABELS[notification.type] || notification.type}
                    </span>
                    <span
                      className={cn(
                        'text-[10px] px-2 py-0.5 rounded-lg font-bold',
                        notification.priority === 'urgent'
                          ? 'bg-rose-500/10 text-rose-400'
                          : notification.priority === 'high'
                          ? 'bg-amber-500/10 text-amber-400'
                          : notification.priority === 'normal'
                          ? 'bg-white/5 text-slate-400'
                          : 'bg-white/5 text-slate-500',
                      )}
                    >
                      {isPriorityOption(notification.priority)
                        ? PRIORITY_LABELS[notification.priority]
                        : notification.priority}
                    </span>
                    {!notification.read && (
                      <span className="text-[10px] px-2 py-0.5 rounded-lg font-bold bg-cyan-500/10 text-cyan-400">غير مقروء</span>
                    )}
                  </div>
                  {notification.body && (
                    <p className="text-sm text-slate-400 mb-2 line-clamp-2">{notification.body}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span>المستخدم: {notification.profiles?.full_name || notification.profiles?.email || notification.user_id}</span>
                    <span className="flex items-center gap-1">
                      <Icon icon={ArrowUpRight} size="xs" />
                      {new Date(notification.created_at).toLocaleString('ar-SA')}
                    </span>
                    {notification.created_by && (
                      <span>أنشأها: {notification.created_by === profile?.id ? 'أنت' : notification.created_by}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      onClick={() => markReadMutation.mutate(notification.id)}
                      disabled={markReadMutation.isPending}
                      icon={<Icon icon={CheckCircle2} size="xs" />}
                    >
                      تحديد كمقروء
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedNotification(notification)}
                    icon={<Icon icon={Search} size="xs" />}
                  >
                    عرض
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      if (confirm('هل أنت متأكد من حذف هذا الإشعار؟')) {
                        deleteMutation.mutate(notification.id);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                    icon={<Icon icon={Trash2} size="xs" />}
                    className="text-rose-400 hover:text-rose-300"
                  >
                    حذف
                  </Button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <GlassCard className="p-8 text-center">
          <Icon icon={Bell} size="xl" className="text-slate-600 mb-3" />
          <p className="text-slate-400 text-sm">لا توجد إشعارات</p>
        </GlassCard>
      )}

      {notifications && notifications.length > 0 && (
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
            disabled={notifications.length < limit}
          >
            التالي
          </Button>
        </div>
      )}

      {showCreateModal && (
        <CreateNotificationModal
          onClose={() => setShowCreateModal(false)}
          onCreate={createMutation.mutate}
          isLoading={createMutation.isPending}
        />
      )}

      {showBroadcastModal && (
        <BroadcastModal
          onClose={() => setShowBroadcastModal(false)}
          onBroadcast={broadcastMutation.mutate}
          isLoading={broadcastMutation.isPending}
        />
      )}

      {selectedNotification && (
        <NotificationDetailModal
          notification={selectedNotification}
          onClose={() => setSelectedNotification(null)}
          onMarkRead={() => markReadMutation.mutate(selectedNotification.id)}
          onDelete={() => { deleteMutation.mutate(selectedNotification.id); setSelectedNotification(null); }}
          isMarkingRead={markReadMutation.isPending}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  );
}

function CreateNotificationModal({
  onClose,
  onCreate,
  isLoading,
}: {
  onClose: () => void;
  onCreate: (input: { user_id: string; title: string; body: string; type?: string; priority?: string }) => void;
  isLoading: boolean;
}) {
  const [userId, setUserId] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState<PriorityOption>('normal');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim() || !title.trim()) return;
    onCreate({ user_id: userId.trim(), title: title.trim(), body: body.trim(), priority });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <GlassCard className="relative z-10 w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">إنشاء إشعار</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <Icon icon={X} size="sm" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">معرّف المستخدم (UUID)</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="uuid المستخدم"
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">العنوان</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="عنوان الإشعار"
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">المحتوى</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="محتوى الإشعار..."
              rows={3}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">الأولوية</label>
            <select
              value={priority}
              onChange={(e) => setPriority(isPriorityOption(e.target.value) ? e.target.value : 'normal')}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500/50"
            >
              <option value="low">منخفضة</option>
              <option value="normal">عادية</option>
              <option value="high">عالية</option>
              <option value="urgent">عاجلة</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="primary" disabled={isLoading} className="flex-1">
              {isLoading ? 'جاري الإنشاء...' : 'إنشاء'}
            </Button>
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
              إلغاء
            </Button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}

function BroadcastModal({
  onClose,
  onBroadcast,
  isLoading,
}: {
  onClose: () => void;
  onBroadcast: (input: { title: string; body: string; priority?: string }) => void;
  isLoading: boolean;
}) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState<PriorityOption>('normal');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onBroadcast({ title: title.trim(), body: body.trim(), priority });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <GlassCard className="relative z-10 w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">بث إشعار لجميع المستخدمين</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <Icon icon={X} size="sm" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">العنوان</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="عنوان الإشعار العام"
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">المحتوى</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="محتوى الإشعار العام..."
              rows={3}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">الأولوية</label>
            <select
              value={priority}
              onChange={(e) => setPriority(isPriorityOption(e.target.value) ? e.target.value : 'normal')}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500/50"
            >
              <option value="low">منخفضة</option>
              <option value="normal">عادية</option>
              <option value="high">عالية</option>
              <option value="urgent">عاجلة</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="primary" disabled={isLoading} className="flex-1">
              {isLoading ? 'جاري البث...' : 'بث للجميع'}
            </Button>
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
              إلغاء
            </Button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}

function NotificationDetailModal({
  notification,
  onClose,
  onMarkRead,
  onDelete,
  isMarkingRead,
  isDeleting,
}: {
  notification: AdminNotification;
  onClose: () => void;
  onMarkRead: () => void;
  onDelete: () => void;
  isMarkingRead: boolean;
  isDeleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <GlassCard className="relative z-10 w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">تفاصيل الإشعار</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <Icon icon={X} size="sm" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1">العنوان</label>
            <p className="text-white font-medium">{notification.title}</p>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">المحتوى</label>
            <p className="text-slate-300 text-sm whitespace-pre-wrap">{notification.body}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1">النوع</label>
              <span className="text-sm text-white">{TYPE_LABELS[notification.type] || notification.type}</span>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">الأولوية</label>
              <span className="text-sm text-white">{isPriorityOption(notification.priority) ? PRIORITY_LABELS[notification.priority] : notification.priority}</span>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">الحالة</label>
              <span className={cn('text-sm', notification.read ? 'text-slate-400' : 'text-cyan-400')}>
                {notification.read ? 'مقروء' : 'غير مقروء'}
              </span>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">تاريخ الإنشاء</label>
              <span className="text-sm text-white">{new Date(notification.created_at).toLocaleString('ar-SA')}</span>
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">المستخدم</label>
            <p className="text-sm text-white">
              {notification.profiles?.full_name || notification.profiles?.email || notification.user_id}
            </p>
          </div>
          {notification.created_by && (
            <div>
              <label className="block text-xs text-slate-500 mb-1">أنشأه</label>
              <p className="text-sm text-white">{notification.created_by}</p>
            </div>
          )}
        </div>
        <div className="flex gap-3 mt-6">
          {!notification.read && (
            <Button variant="secondary" onClick={onMarkRead} disabled={isMarkingRead} className="flex-1">
              {isMarkingRead ? 'جاري التنفيذ...' : 'تحديد كمقروء'}
            </Button>
          )}
          <Button variant="ghost" onClick={onDelete} disabled={isDeleting} className="flex-1 text-rose-400 hover:text-rose-300">
            {isDeleting ? 'جاري الحذف...' : 'حذف'}
          </Button>
          <Button variant="primary" onClick={onClose} className="flex-1">
            إغلاق
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}
