import type { ComponentType, SVGProps } from 'react';
import type { SubjectReference, ReferenceType } from '../src/types';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { Icon } from '@/src/components/ui/Icon';
import { Button } from '@/src/components/ui/Button';
import { ExternalLink, Trash2, Video, FileText, Link2, Heart, Pencil } from 'lucide-react';

type ReferencesListProps = {
  references: SubjectReference[];
  onDelete: (id: string) => void;
  onEdit?: (id: string, updates: { title: string; url: string; description?: string; type: ReferenceType }) => void;
  onLike?: (id: string) => void;
  onUnlike?: (id: string) => void;
  isRemoving: boolean;
  isUpdating?: boolean;
  isLiking?: boolean;
  isUnliking?: boolean;
  currentUserId?: string;
  showLikes?: boolean;
  showEdit?: boolean;
};

const typeConfig: Record<ReferenceType, { icon: ComponentType<SVGProps<SVGSVGElement>>; label: string; color: string }> = {
  video: { icon: Video, label: 'فيديو', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
  reference: { icon: FileText, label: 'مرجع', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
  link: { icon: Link2, label: 'رابط', color: 'text-green-400 bg-green-500/10 border-green-500/20' },
};

export function ReferencesList({
  references,
  onDelete,
  onEdit,
  onLike,
  onUnlike,
  isRemoving,
  isUpdating,
  isLiking,
  isUnliking,
  currentUserId,
  showLikes = true,
  showEdit = true,
}: ReferencesListProps) {
  if (references.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p>لا توجد مصادر مضافة بعد.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {references.map((ref) => {
        const config = typeConfig[ref.type];
        const TypeIcon = config.icon;
        const isOwner = currentUserId && ref.user_id === currentUserId;
        const isLiked = ref.isLiked;

        return (
          <GlassCard key={ref.id}>
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${config.color}`}>
                  <Icon icon={TypeIcon} size="sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${config.color}`}>
                      {config.label}
                    </span>
                    <h4 className="text-white font-medium text-sm truncate">{ref.title}</h4>
                  </div>
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
                  {showLikes && (
                    <div className="flex items-center gap-1 mt-2">
                      {onLike && !isLiked && (
                        <button
                          onClick={() => onLike(ref.id)}
                          disabled={isLiking}
                          className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-400 transition-colors"
                        >
                          <Heart className="w-3.5 h-3.5" />
                          <span>{ref.likes || 0}</span>
                        </button>
                      )}
                      {onUnlike && isLiked && (
                        <button
                          onClick={() => onUnlike(ref.id)}
                          disabled={isUnliking}
                          className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 transition-colors"
                        >
                          <Heart className="w-3.5 h-3.5 fill-rose-400" />
                          <span>{ref.likes || 0}</span>
                        </button>
                      )}
                      {!onLike && !onUnlike && (
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Heart className="w-3.5 h-3.5" />
                          <span>{ref.likes || 0}</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {showEdit && isOwner && onEdit && (
                    <Button
                      variant="secondary"
                      onClick={() => onEdit(ref.id, { title: ref.title, url: ref.url, description: ref.description, type: ref.type })}
                      disabled={isUpdating}
                      className="shrink-0"
                    >
                      <Icon icon={Pencil} size="xs" />
                    </Button>
                  )}
                  {isOwner && (
                    <Button
                      variant="danger"
                      onClick={() => onDelete(ref.id)}
                      disabled={isRemoving}
                      className="shrink-0"
                    >
                      <Icon icon={Trash2} size="xs" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}
