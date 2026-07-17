'use client';

import { GlassCard } from '@/src/components/ui/GlassCard';
import { Button } from '@/src/components/ui/Button';
import { Icon } from '@/src/components/ui/Icon';
import { X } from 'lucide-react';
import { isPriorityOption, PRIORITY_LABELS, TYPE_LABELS } from './NotificationManagement';
import type { AdminNotification } from '../../features/admin/services/adminNotificationService.supabase';

type NotificationDetailModalProps = {
  notification: AdminNotification;
  onClose: () => void;
  onMarkRead: () => void;
  onDelete: () => void;
  isMarkingRead: boolean;
  isDeleting: boolean;
};

export function NotificationDetailModal({ notification, onClose, onMarkRead, onDelete, isMarkingRead, isDeleting }: NotificationDetailModalProps) {
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
              <span className={notification.read ? 'text-sm text-slate-400' : 'text-sm text-cyan-400'}>
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
