import { useState, useEffect } from 'react';
import type { ReferenceType, SubjectReferenceUpdate } from '../src/types';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { Button } from '@/src/components/ui/Button';
import { InputField } from '@/src/components/ui/InputField';
import { X } from 'lucide-react';

type EditReferenceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialData: {
    title: string;
    url: string;
    description?: string;
    type: ReferenceType;
  };
  onSave: (updates: SubjectReferenceUpdate) => Promise<void> | void;
  isSaving: boolean;
};

const referenceTypes: { value: ReferenceType; label: string }[] = [
  { value: 'video', label: 'فيديو' },
  { value: 'reference', label: 'مرجع' },
  { value: 'link', label: 'رابط' },
];

export function EditReferenceModal({ isOpen, onClose, initialData, onSave, isSaving }: EditReferenceModalProps) {
  const [type, setType] = useState<ReferenceType>(initialData.type);
  const [title, setTitle] = useState(initialData.title);
  const [url, setUrl] = useState(initialData.url);
  const [description, setDescription] = useState(initialData.description || '');

  useEffect(() => {
    if (isOpen) {
      setType(initialData.type);
      setTitle(initialData.title);
      setUrl(initialData.url);
      setDescription(initialData.description || '');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;
    await onSave({ type, title: title.trim(), url: url.trim(), description: description.trim() || undefined });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <GlassCard className="relative w-full max-w-lg">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">تعديل المصدر</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-300 mb-2">النوع</label>
              <div className="flex gap-2">
                {referenceTypes.map((rt) => (
                  <button
                    key={rt.value}
                    type="button"
                    onClick={() => setType(rt.value)}
                    className={`
                      flex-1 px-3 py-2 rounded-lg text-sm border transition-all
                      ${type === rt.value
                        ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                        : 'bg-white/5 text-slate-400 border-white/8 hover:bg-white/10'
                      }
                    `}
                  >
                    {rt.label}
                  </button>
                ))}
              </div>
            </div>

            <InputField
              label="العنوان"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              placeholder="عنوان المصدر"
              required
            />

            <InputField
              label="الرابط"
              type="url"
              value={url}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
              placeholder="https://..."
              required
            />

            <div>
              <label className="block text-sm text-slate-300 mb-2">الوصف (اختياري)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="وصف مختصر للمصدر..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/8 text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500/50 transition-colors resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" variant="primary" isLoading={isSaving} className="flex-1">
                حفظ التعديلات
              </Button>
              <Button type="button" variant="secondary" onClick={onClose}>
                إلغاء
              </Button>
            </div>
          </form>
        </div>
      </GlassCard>
    </div>
  );
}
