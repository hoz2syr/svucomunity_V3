"use client";

import { useEffect, useState, useCallback } from 'react';
import { Users, RotateCcw, Trash2 } from 'lucide-react';
import { useAuth } from '@/src/contexts/AuthContext';
import { studyGroupService } from '../core/services';
import { GroupCard } from '../../components/GroupCard';
import { StudyGroupCardSkeleton } from '../../components/StudyGroupCardSkeleton';
import { GroupDetailsModal } from '../../components/GroupDetailsModal';
import type { StudyGroupEnriched } from '../hooks/useStudyGroups';
import type { StudyGroup } from '../types';
import { useStudyGroupsPage } from '../hooks/useStudyGroupsPage';
import { useStudyGroupsToast } from '../hooks/useStudyGroupsToast';
import { ErrorState } from '../../components/ErrorState';
import { Button } from '@/src/components/ui/Button';
import { convertSemesterCodeToLabel } from '@/src/features/schedule-extraction/utils/semesterUtils';

export default function MyGroupsPage() {
  const { session, profile } = useAuth();
  const userId = session?.user?.id;
  const [createdGroups, setCreatedGroups] = useState<StudyGroup[]>([]);
  const [joinedGroups, setJoinedGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const page = useStudyGroupsPage(userId);

  useEffect(() => {
    if (!userId) return;
    
    const loadMyGroups = async () => {
      setLoading(true);
      setError(null);
      try {
        const { created, joined } = await studyGroupService.getMyGroups(userId);
        setCreatedGroups(created || []);
        setJoinedGroups(joined || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'فشل تحميل مجموعاتك');
      } finally {
        setLoading(false);
      }
    };

    loadMyGroups();
  }, [userId]);

  const handleGroupClick = (groupId: string) => {
    const allGroups = [...createdGroups, ...joinedGroups] as StudyGroupEnriched[];
    page.handleOpenDetails(groupId, allGroups);
  };

  const handleReactivate = useCallback(async (groupId: string) => {
    await studyGroupService.reactivateGroup(groupId);
    const update = (groups: StudyGroup[]) => groups.map(g => g.id === groupId ? { ...g, is_archived: false } : g);
    setCreatedGroups(prev => update(prev));
    setJoinedGroups(prev => update(prev));
  }, []);

  const { notifyDeleteSuccess, notifyError } = useStudyGroupsToast();

  const handleDelete = useCallback(async (groupId: string) => {
    try {
      await studyGroupService.deleteGroup(groupId);
      notifyDeleteSuccess();
      const filter = (groups: StudyGroup[]) => groups.filter(g => g.id !== groupId);
      setCreatedGroups(prev => filter(prev));
      setJoinedGroups(prev => filter(prev));
    } catch (err) {
      notifyError(err instanceof Error ? err.message : 'فشل حذف المجموعة');
    }
  }, [notifyDeleteSuccess, notifyError]);

  if (!userId) {
    return (
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6">
        <p className="text-slate-400 text-center">يرجى تسجيل الدخول لعرض مجموعاتك</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <StudyGroupCardSkeleton count={4} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6">
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  const activeCreated = createdGroups.filter(g => !g.is_archived);
  const archivedCreated = createdGroups.filter(g => g.is_archived);
  const activeJoined = joinedGroups.filter(g => !g.is_archived);
  const archivedJoined = joinedGroups.filter(g => g.is_archived);

  const totalActive = activeCreated.length + activeJoined.length;
  const totalArchived = archivedCreated.length + archivedJoined.length;

  if (totalActive === 0 && totalArchived === 0) {
    return (
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6">
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center">
            <Users className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">لا توجد مجموعات</h3>
          <p className="text-slate-400 mb-4 text-sm">أنت لست عضو في أي مجموعة بعد</p>
        </div>
      </div>
    );
  }

  const renderGroupSection = (title: string, groups: StudyGroup[], accentColor: string, isArchived = false) => {
    if (groups.length === 0) return null;
    return (
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className={`w-2 h-2 ${accentColor} rounded-full`}></span>
          {title} ({groups.length})
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {groups.map((group) => (
            <div key={group.id} className="relative">
              <GroupCard group={group} onClick={handleGroupClick} />
              {isArchived && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-slate-400">
                    {convertSemesterCodeToLabel(group.semester_code)}
                  </span>
                  {group.creator_id === userId && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        onClick={() => handleReactivate(group.id)}
                        className="h-7 px-2 text-xs"
                      >
                        <RotateCcw className="w-3 h-3 ml-1" />
                        إعادة تفعيل
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => handleDelete(group.id)}
                        className="h-7 px-2 text-xs text-rose-400 hover:text-rose-300"
                      >
                        <Trash2 className="w-3 h-3 ml-1" />
                        حذف
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6">
      {renderGroupSection('المجموعات النشطة', activeCreated, 'bg-emerald-400')}
      {renderGroupSection('المجموعات التي انضممت إلها', activeJoined, 'bg-cyan-400')}
      {renderGroupSection('المجموعات المؤرشفة', archivedCreated, 'bg-slate-500', true)}
      {renderGroupSection('المجموعات المؤرشفة (عضوية)', archivedJoined, 'bg-slate-500', true)}

      <GroupDetailsModal
        group={page.selectedGroup as StudyGroupEnriched | null}
        isOpen={!!page.selectedGroupId}
        onClose={page.handleCloseDetails}
        isMember={page.isMember}
        canDelete={page.canDelete}
        currentUserMajor={profile?.major || undefined}
        onJoin={page.handleJoin}
        onLeave={page.handleLeave}
        onEdit={page.handleEdit}
        onDelete={page.handleDelete}
        joiningId={page.joiningId}
        leavingId={page.leavingId}
      />
    </div>
  );
}