import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { Button } from '@/src/components/ui/Button';
import { Icon } from '@/src/components/ui/Icon';
import { ReferencesList } from '../../components/ReferencesList';
import { EditReferenceModal } from '../../components/EditReferenceModal';
import { useUserReferences } from '../hooks/useUserReferences';
import { getSubjectByCode } from '../services/subjects.service';
import type { ReferenceType } from '../types';
import { ArrowLeft, Plus } from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';

export function MyReferencesPage() {
  const { references, isLoading, error, updateReference, removeReference, isUpdating, isRemoving } = useUserReferences();
  const [editingReference, setEditingReference] = useState<{ id: string; title: string; url: string; description?: string; type: ReferenceType } | null>(null);

  const getSubjectName = (courseCode: string) => {
    const subject = getSubjectByCode(courseCode);
    return subject?.name || courseCode;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Link to="/dashboard/subjects" className="hover:text-orange-400 transition-colors">المصادر</Link>
          <span>/</span>
          <span className="text-white">مشاركاتي</span>
        </div>
        <Link to="/dashboard/subjects">
          <Button variant="secondary">
            <Icon icon={ArrowLeft as ComponentType<SVGProps<SVGSVGElement>>} size="sm" />
            <span className="mr-2">العودة للمصادر</span>
          </Button>
        </Link>
      </div>

      <GlassCard className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">مشاركاتي</h1>
            <p className="text-slate-400 text-sm">المصادر التي قمت بمشاركتها</p>
          </div>
          <Link to="/dashboard/subjects">
            <Button variant="primary">
              <Icon icon={Plus as ComponentType<SVGProps<SVGSVGElement>>} size="sm" />
              <span className="mr-2">إضافة مصدر</span>
            </Button>
          </Link>
        </div>
      </GlassCard>

      {error && (
        <div className="text-red-400 text-sm text-center py-4">{error}</div>
      )}

      {isLoading ? (
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <GlassCard key={i} className="p-5">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-white/10 rounded w-3/4"></div>
                <div className="h-3 bg-white/5 rounded w-1/2"></div>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : references.length === 0 ? (
        <GlassCard className="p-8 text-center">
          <p className="text-slate-400 text-sm">لم تقم بإضافة أي مصادر بعد.</p>
          <Link to="/dashboard/subjects" className="inline-block mt-4">
            <Button variant="secondary">تصفح المصادر</Button>
          </Link>
        </GlassCard>
      ) : (
        <div className="space-y-6">
          {references.map((ref) => (
            <div key={ref.id} className="space-y-2">
              <div className="text-xs text-slate-500 px-1">
                {getSubjectName(ref.course_code)}
              </div>
              <ReferencesList
                references={[ref]}
                onDelete={(id) => removeReference(id)}
                onEdit={(id, updates) => setEditingReference({ id, ...updates, type: updates.type || 'reference' })}
                isRemoving={isRemoving}
                isUpdating={isUpdating}
                currentUserId={ref.user_id}
                showEdit
                showLikes={false}
              />
            </div>
          ))}
        </div>
      )}

      {editingReference && (
        <EditReferenceModal
          isOpen={Boolean(editingReference)}
          onClose={() => setEditingReference(null)}
          initialData={editingReference}
          onSave={async (updates) => { await updateReference(editingReference.id, updates); }}
          isSaving={isUpdating}
        />
      )}
    </div>
  );
}
