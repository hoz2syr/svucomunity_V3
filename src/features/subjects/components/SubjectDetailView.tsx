import { useState } from 'react';
import type { ComponentType, SVGProps } from 'react';
import { Link } from 'react-router-dom';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { Button } from '@/src/components/ui/Button';
import { Icon } from '@/src/components/ui/Icon';
import { SubjectTabs } from './SubjectTabs';
import { ReferencesList } from './ReferencesList';
import { AddReferenceModal } from './AddReferenceModal';
import { EditReferenceModal } from './EditReferenceModal';
import { useSubjectDetail } from '../src/hooks/useSubjectDetail';
import type { SubjectTab } from '../src/types';
import { Plus } from 'lucide-react';
import { useToast } from '@/src/components/ui/Toast';

type SubjectDetailViewProps = {
  courseCode: string;
};

export function SubjectDetailView({ courseCode }: SubjectDetailViewProps) {
  const [activeTab, setActiveTab] = useState<SubjectTab>('info');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingReference, setEditingReference] = useState<{ id: string; title: string; url: string; description?: string; type: 'video' | 'reference' | 'link' } | null>(null);
  const { toast } = useToast();
  const {
    subject,
    references,
    referencesError,
    addReference,
    updateReference,
    removeReference,
    likeReference,
    unlikeReference,
    isAdding,
    isUpdating,
    isRemoving,
    isLiking,
    isUnliking,
    canAdd,
    currentUserId,
  } = useSubjectDetail(courseCode);

  if (!subject) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p>المادة غير موجودة.</p>
        <Link to="/dashboard/subjects">
          <Button variant="secondary" className="mt-4">العودة للمصادر</Button>
        </Link>
      </div>
    );
  }

  const levelLabel = typeof subject.level === 'number' ? `السنة ${subject.level}` : subject.level;

  const userReferences = references.filter((r) => r.user_id === currentUserId);

  const handleAddSuccess = () => {
    toast('شكرا لك على المساهمة في تحسين الموقع', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Link to="/dashboard/subjects" className="hover:text-orange-400 transition-colors">المصادر</Link>
        <span>/</span>
        <span className="text-white">{subject.name}</span>
      </div>

      <GlassCard>
        <div className="p-6">
          <div className="flex items-start gap-4 mb-4">
            {subject.icon && (
              <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-400 shrink-0">
                <Icon icon={subject.icon as unknown as ComponentType<SVGProps<SVGSVGElement>>} size="xl" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">{subject.name}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                <span>{levelLabel}</span>
                <span className="w-1 h-1 rounded-full bg-slate-500" />
                <span>{subject.credits} ساعة</span>
                <span className="w-1 h-1 rounded-full bg-slate-500" />
                <span>الصعوبة: {subject.diff === 1 ? 'سهل' : subject.diff === 2 ? 'متوسط' : 'صعب'}</span>
              </div>
            </div>
          </div>

          {subject.prereqs.length > 0 && (
            <div className="text-sm text-slate-400">
              <span className="text-slate-500">المتطلبات: </span>
              {subject.prereqs.join('، ')}
            </div>
          )}
        </div>
      </GlassCard>

      <SubjectTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="min-h-[200px]">
        {activeTab === 'info' && (
          <div className="space-y-4">
            {subject.info?.over && (
              <GlassCard>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-white mb-2">نظرة عامة</h3>
                  <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{subject.info.over}</p>
                </div>
              </GlassCard>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {subject.info?.doc && (
                <GlassCard>
                  <div className="p-5">
                    <h3 className="text-sm font-bold text-orange-400 mb-2">المحاضرات</h3>
                    <p className="text-slate-300 text-sm">{subject.info.doc}</p>
                  </div>
                </GlassCard>
              )}
              {subject.info?.prac && (
                <GlassCard>
                  <div className="p-5">
                    <h3 className="text-sm font-bold text-cyan-400 mb-2">التطبيقات</h3>
                    <p className="text-slate-300 text-sm">{subject.info.prac}</p>
                  </div>
                </GlassCard>
              )}
              {subject.info?.exam && (
                <GlassCard>
                  <div className="p-5">
                    <h3 className="text-sm font-bold text-green-400 mb-2">الامتحانات</h3>
                    <p className="text-slate-300 text-sm">{subject.info.exam}</p>
                  </div>
                </GlassCard>
              )}
            </div>
          </div>
        )}

        {activeTab === 'references' && (
          <div className="space-y-4">
            {canAdd && (
              <div className="flex justify-end">
                <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
                  <Icon icon={Plus as ComponentType<SVGProps<SVGSVGElement>>} size="sm" />
                  <span className="mr-2">إضافة مصدر</span>
                </Button>
              </div>
            )}
            {referencesError && (
              <div className="text-red-400 text-sm text-center py-4">{referencesError}</div>
            )}
            <ReferencesList
              references={references}
              onDelete={removeReference}
              onEdit={(id, updates) => setEditingReference({ id, ...updates, type: updates.type || 'reference' })}
              onLike={likeReference}
              onUnlike={unlikeReference}
              isRemoving={isRemoving}
              isUpdating={isUpdating}
              isLiking={isLiking}
              isUnliking={isUnliking}
              currentUserId={currentUserId}
              showEdit={canAdd}
            />
          </div>
        )}

        {activeTab === 'my-contributions' && (
          <div className="space-y-4">
            {canAdd && (
              <div className="flex justify-end">
                <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
                  <Icon icon={Plus as ComponentType<SVGProps<SVGSVGElement>>} size="sm" />
                  <span className="mr-2">إضافة مصدر</span>
                </Button>
              </div>
            )}
            {userReferences.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <p>لم تقم بإضافة أي مصادر بعد في هذه المادة.</p>
              </div>
            ) : (
              <ReferencesList
                references={userReferences}
                onDelete={removeReference}
                onEdit={(id, updates) => setEditingReference({ id, ...updates, type: updates.type || 'reference' })}
                isRemoving={isRemoving}
                isUpdating={isUpdating}
                currentUserId={currentUserId}
                showEdit
                showLikes={false}
              />
            )}
          </div>
        )}

        {activeTab === 'tests' && (
          <div className="text-center py-12 text-slate-500">
            <p>الاختبارات المنشورة ستظهر هنا.</p>
            <Link to={`/exam/browse?course_code=${courseCode}`}>
              <Button variant="secondary" className="mt-4">تصفح الاختبارات</Button>
            </Link>
          </div>
        )}

        {activeTab === 'groups' && (
          <div className="text-center py-12 text-slate-500">
            <p>المجموعات الدراسية ستظهر هنا.</p>
            <Link to={`/dashboard/study-groups?course_code=${courseCode}`}>
              <Button variant="secondary" className="mt-4">تصفح المجموعات</Button>
            </Link>
          </div>
        )}
      </div>

      <AddReferenceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        courseCode={courseCode}
        onAdd={async (reference) => {
          const result = await addReference(reference);
          if (!result.error) {
            handleAddSuccess();
          }
          return result;
        }}
        isAdding={isAdding}
      />

      {editingReference && (
        <EditReferenceModal
          isOpen={Boolean(editingReference)}
          onClose={() => setEditingReference(null)}
          initialData={editingReference}
          onSave={(updates) => updateReference(editingReference.id, updates)}
          isSaving={isUpdating}
        />
      )}
    </div>
  );
}
