"use client";

import { useStudyGroupsPage } from '../hooks/useStudyGroupsPage';
import type { StudyGroupEnriched } from '../hooks/useStudyGroups';
import { StudyGroupsFilters } from '../../components/StudyGroupsFilters';
import { GroupCard } from '../../components/GroupCard';
import { CreateGroupModal } from '../../components/CreateGroupModal';
import { EditGroupModal } from '../../components/EditGroupModal';
import { GroupDetailsModal } from '../../components/GroupDetailsModal';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { ErrorState } from '../../components/ErrorState';
import { StudyGroupCardSkeleton } from '../../components/StudyGroupCardSkeleton';
import { Button } from '@/src/components/ui/Button';
import { Users } from 'lucide-react';
import { useAuth } from '@/src/contexts/AuthContext';

export default function StudyGroupsHome() {
  const { session, profile } = useAuth();
  const userId = session?.user?.id;
  const userMajor = profile?.major || undefined;

  const page = useStudyGroupsPage(userId);

  return (
    <ErrorBoundary>
      <div className="max-w-6xl mx-auto px-3 sm:px-4 pt-6 pb-2">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
              المجموعات الدراسية
            </h1>
            <p className="text-slate-400 text-sm">
              تصفح المجموعات المتاحة أو أنشئ مجموعة جديدة
            </p>
          </div>
          <Button onClick={page.handleOpenCreateModal} className="hidden sm:flex">
            <Users className="w-4 h-4" />
            إنشاء مجموعة
          </Button>
        </div>
      </div>

      <StudyGroupsFilters
        filters={page.filters}
        majors={page.majors}
        courses={page.courses}
        classes={page.classes}
        onUpdateFilter={page.updateFilter}
        onClearFilters={page.clearFilters}
        onSearchChange={page.onSearchChange}
      />

      <div className="max-w-6xl mx-auto px-3 sm:px-4">
        {page.loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-8">
            <StudyGroupCardSkeleton count={8} />
          </div>
        )}

        {!page.loading && page.error && (
          <ErrorState message={page.error} onRetry={page.reload} />
        )}

        {!page.loading && !page.error && page.groups.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center">
              <Users className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">لا توجد مجموعات</h3>
            <p className="text-slate-400 mb-4 text-sm">كن أول من يُنشئ مجموعة!</p>
            <Button onClick={page.handleOpenCreateModal} className="hidden sm:inline-flex">
              إنشاء مجموعة
            </Button>
          </div>
        )}

        {!page.loading && !page.error && page.groups.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-8">
            {(page.groups as StudyGroupEnriched[]).map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                onClick={(id) => page.handleOpenDetails(id, page.groups as StudyGroupEnriched[])}
              />
            ))}
          </div>
        )}
      </div>

      <Button
        onClick={page.handleOpenCreateModal}
        className="sm:hidden fixed bottom-6 left-6 z-40 w-14 h-14 rounded-full !p-0 shadow-[var(--shadow-glow-cyan-40)]"
        icon={<Users className="w-6 h-6" />}
      />

<CreateGroupModal
         isOpen={page.showCreateModal}
         onClose={page.handleCloseCreateModal}
         onSubmit={page.handleCreateGroup}
         getCoursesByMajor={page.handleGetCoursesByMajor}
         availableMajors={page.majors}
         userMajor={userMajor}
       />

       <GroupDetailsModal
         group={page.selectedGroup as StudyGroupEnriched | null}
         isOpen={!!page.selectedGroupId}
         onClose={page.handleCloseDetails}
         isMember={page.isMember}
         canDelete={page.canDelete}
         currentUserMajor={userMajor}
         onJoin={page.handleJoin}
         onLeave={page.handleLeave}
         onEdit={page.handleEdit}
         onDelete={page.handleDelete}
         joiningId={page.joiningId}
         leavingId={page.leavingId}
       />

<EditGroupModal
         isOpen={page.showEditModal}
         onClose={page.handleCloseEditModal}
         onSubmit={page.handleEditSubmit}
         group={page.selectedGroup as StudyGroupEnriched | null}
         getCoursesByMajor={page.handleGetCoursesByMajor}
         availableMajors={page.majors}
       />
    </ErrorBoundary>
  );
}
