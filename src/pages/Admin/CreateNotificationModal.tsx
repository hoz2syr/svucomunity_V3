'use client';

import { useState, type FormEvent } from 'react';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { Button } from '@/src/components/ui/Button';
import { Icon } from '@/src/components/ui/Icon';
import { X } from 'lucide-react';
import { isPriorityOption, PRIORITY_LABELS, type PriorityOption } from '../NotificationManagement';

type CreateNotificationModalProps = {
  onClose: () => void;
  onCreate: (input: { user_id: string; title: string; body: string; priority?: string }) => void;
  isLoading: boolean;
};

export function CreateNotificationModal({ onClose, onCreate, isLoading }: CreateNotificationModalProps) {
  const [userId, setUserId] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState<PriorityOption>('normal');

  const handleSubmit = (e: FormEvent) => {
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
