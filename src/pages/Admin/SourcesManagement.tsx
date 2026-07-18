'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { Button } from '@/src/components/ui/Button';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { Icon } from '@/src/components/ui/Icon';
import {
  fetchAllReferences,
  updateReference,
  removeReference,
} from '@/src/features/subjects/src/services/subjects.service';
import { getSubjectByCode } from '@/src/features/subjects/src/services/subjects.service';
import type { SubjectReference, SubjectReferenceUpdate } from '@/src/features/subjects/src/types';
import {
  Search,
  RefreshCw,
  AlertTriangle,
  Trash2,
  CheckCircle2,
  ExternalLink,
  UploadCloud,
} from 'lucide-react';
import { EditReferenceModal } from '@/src/features/subjects/components/EditReferenceModal';
import { BulkImportModal } from '@/src/features/subjects/components/BulkImportModal';
import { cn } from '@/src/lib/utils';
import { useToast } from '@/src/components/ui/Toast';

export function SourcesManagement() {
  const { profile, loading: authLoading } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const { toast } = useToast();

  const [references, setReferences] = useState<SubjectReference[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [editingReference, setEditingReference] = useState<{ id: string; title: string; url: string; description?: string; type: 'video' | 'reference' | 'link' } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'list' | 'bulk-import'>('list');
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);

  const loadReferences = async () => {
    setIsLoading(true);
    setError(null);
    const result = await fetchAllReferences();
    if (result.error) {
      setError(result.error.message);
    } else if (result.data) {
      setReferences(result.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadReferences();
  }, []);

  const subjects = Array.from(new Set(references.map((r) => r.course_code))).sort();

  const filteredReferences = references.filter((ref) => {
    const matchesSearch = !searchQuery ||
      ref.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ref.url.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = !subjectFilter || ref.course_code === subjectFilter;
    return matchesSearch && matchesSubject;
  });

  const handleEdit = async (updates: SubjectReferenceUpdate) => {
    if (!editingReference) return;
    setIsSaving(true);
    const result = await updateReference(editingReference.id, updates);
    setIsSaving(false);
    if (result.error) {
      toast(result.error.message, 'error');
    } else {
      toast('تم تعديل المصدر بنجاح', 'success');
      setEditingReference(null);
      loadReferences();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المصدر؟')) return;
    setIsDeleting(id);
    const result = await removeReference(id);
    setIsDeleting(null);
    if (result.error) {
      toast(result.error.message, 'error');
    } else {
      toast('تم حذف المصدر بنجاح', 'success');
      loadReferences();
    }
  };

  const handleToggleApproval = async (ref: SubjectReference) => {
    const result = await updateReference(ref.id, { is_approved: !ref.is_approved });
    if (result.error) {
      toast(result.error.message, 'error');
    } else {
      toast(ref.is_approved ? 'تم إخفاء المصدر' : 'تم الموافقة على المصدر', 'success');
      loadReferences();
    }
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
        <h1 className="text-3xl font-bold text-white tracking-tight">إدارة المصادر</h1>
        <p className="text-slate-400 text-sm max-w-xl">عرض وتعديل وحذف جميع المصادر المضافة من قبل المستخدمين</p>
      </div>

      <div className="flex items-center gap-2 border-b border-white/10">
        <button
          onClick={() => setActiveSubTab('list')}
          className={cn(
            'px-4 py-2.5 text-sm font-medium border-b-2 transition-all',
            activeSubTab === 'list'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-white'
          )}
        >
          قائمة المصادر
        </button>
        <button
          onClick={() => setIsBulkImportOpen(true)}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all',
            'border-transparent text-slate-400 hover:text-white'
          )}
        >
          <Icon icon={UploadCloud} size="xs" />
          استيراد جماعي
        </button>
      </div>

      {activeSubTab === 'list' && (
        <>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Icon icon={Search} size="sm" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="بحث في المصادر..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500/50"
            >
              <option value="">كل المواد</option>
              {subjects.map((code) => (
                <option key={code} value={code}>{getSubjectByCode(code)?.name || code}</option>
              ))}
            </select>
            <Button
              variant="secondary"
              onClick={loadReferences}
              icon={<Icon icon={RefreshCw} size="xs" />}
            >
              تحديث
            </Button>
          </div>

          {error && (
            <GlassCard className="p-4 border-rose-500/30">
              <div className="flex items-center gap-2 text-rose-400">
                <Icon icon={AlertTriangle} size="sm" />
                <span className="text-sm">{error}</span>
              </div>
            </GlassCard>
          )}

          {isLoading ? (
            <div className="grid gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <GlassCard key={i} className="p-5">
                  <Skeleton className="w-full h-20" />
                </GlassCard>
              ))}
            </div>
          ) : filteredReferences.length === 0 ? (
            <GlassCard className="p-8 text-center">
              <Icon icon={CheckCircle2} size="xl" className="text-slate-500 mb-3 mx-auto" />
              <p className="text-slate-400 text-sm">لا يوجد مصادر</p>
            </GlassCard>
          ) : (
            <div className="grid gap-4">
              {filteredReferences.map((ref) => (
                <GlassCard key={ref.id} className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={cn(
                          'text-xs px-2.5 py-1 rounded-lg',
                          ref.type === 'video' && 'bg-red-500/10 text-red-400',
                          ref.type === 'reference' && 'bg-cyan-500/10 text-cyan-400',
                          ref.type === 'link' && 'bg-green-500/10 text-green-400',
                        )}>
                          {ref.type === 'video' ? 'فيديو' : ref.type === 'reference' ? 'مرجع' : 'رابط'}
                        </span>
                        <span className={cn(
                          'text-xs px-2.5 py-1 rounded-lg',
                          ref.is_approved ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                        )}>
                          {ref.is_approved ? 'موافق عليه' : 'مخفي'}
                        </span>
                        <span className="text-xs text-slate-500">
                          {getSubjectByCode(ref.course_code)?.name || ref.course_code}
                        </span>
                      </div>
                      <h4 className="text-white font-medium text-sm mb-1">{ref.title}</h4>
                      {ref.description && (
                        <p className="text-slate-400 text-xs mb-2 line-clamp-2">{ref.description}</p>
                      )}
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-orange-400 text-xs hover:text-orange-300 transition-colors"
                      >
                        <span className="truncate max-w-[200px]">{ref.url}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                        <span>{ref.user_id}</span>
                        <span>|</span>
                        <span>{ref.likes || 0} إعجاب</span>
                        <span>|</span>
                        <time>{new Date(ref.created_at).toLocaleString('ar-SA')}</time>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="secondary"
                        onClick={() => setEditingReference({ id: ref.id, title: ref.title, url: ref.url, description: ref.description, type: ref.type })}
                        disabled={isSaving}
                      >
                        تعديل
                      </Button>
                      <Button
                        variant={ref.is_approved ? 'secondary' : 'primary'}
                        onClick={() => handleToggleApproval(ref)}
                        disabled={isSaving}
                      >
                        {ref.is_approved ? 'إخفاء' : 'موافقة'}
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleDelete(ref.id)}
                        disabled={isDeleting === ref.id}
                      >
                        <Icon icon={Trash2} size="xs" />
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </>
      )}

      {editingReference && (
        <EditReferenceModal
          isOpen={Boolean(editingReference)}
          onClose={() => setEditingReference(null)}
          initialData={editingReference}
          onSave={handleEdit}
          isSaving={isSaving}
        />
      )}

      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        adminId={profile?.id || ''}
        onImported={loadReferences}
      />
    </div>
  );
}
