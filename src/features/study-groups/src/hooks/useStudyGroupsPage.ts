import { useState, useCallback, useEffect, useMemo } from 'react';
import { studyGroupService } from '../core/services';
import { useStudyGroupsActions } from './useStudyGroupsActions';
import { useStudyGroups, type StudyGroupEnriched } from './useStudyGroups';
import { CLASSES } from '../constants';
import type { StudyGroup } from '../types';

export function useStudyGroupsPage(userId: string | undefined) {
  const {
    groups,
    loading,
    error,
    filters,
    updateFilter,
    clearFilters,
    courses,
    reload,
    onSearchChange,
  } = useStudyGroups(userId);

  const { handleCreateGroup, handleOpenDetails: openDetails, handleJoinGroup, handleLeaveGroup, handleEditGroup, handleDeleteGroup: deleteGroupAction, handleGetCoursesByMajor, } = useStudyGroupsActions(reload);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<StudyGroupEnriched | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [leavingId, setLeavingId] = useState<string | null>(null);
  const [majors, setMajors] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch('/svu_courses.json')
      .then(res => res.json())
      .then(data => {
        if (!cancelled && data && typeof data === 'object') {
          setMajors(Object.keys(data));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  const [rawIsAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const checkAdmin = async () => {
      if (!userId) return;
      const admin = await studyGroupService.checkIsAdmin(userId);
      if (!cancelled) setIsAdmin(admin);
    };
    checkAdmin();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const isAdmin = useMemo(() => rawIsAdmin, [rawIsAdmin]);

  const handleOpenCreateModal = useCallback(() => setShowCreateModal(true), []);
  const handleCloseCreateModal = useCallback(() => setShowCreateModal(false), []);
  const handleOpenEditModal = useCallback(() => setShowEditModal(true), []);
  const handleCloseEditModal = useCallback(() => setShowEditModal(false), []);

  const handleOpenDetails = useCallback(async (groupId: string, groups: StudyGroup[]) => {
    const group = await openDetails(groupId, groups);
    if (!group) return;
    setSelectedGroup(group as StudyGroupEnriched);
    setSelectedGroupId(groupId);

    if (userId) {
      const member = await studyGroupService.checkMembership(groupId, userId);
      setIsMember(member);
    } else {
      setIsMember(false);
    }
  }, [openDetails, userId]);

  const handleCloseDetails = useCallback(() => {
    setSelectedGroup(null);
    setSelectedGroupId(null);
    setIsMember(false);
    setJoiningId(null);
    setLeavingId(null);
  }, []);

  const handleJoin = useCallback(async (groupId: string) => {
    setJoiningId(groupId);
    await handleJoinGroup(groupId, () => setIsMember(true));
    setJoiningId(null);
  }, [handleJoinGroup]);

  const handleDelete = useCallback(() => {
    if (!selectedGroup) return;
    deleteGroupAction(selectedGroup, () => {
      handleCloseDetails();
    });
  }, [selectedGroup, deleteGroupAction, handleCloseDetails]);

  const handleLeave = useCallback(async (groupId: string, groupName: string) => {
    setLeavingId(groupId);
    await handleLeaveGroup(groupId, groupName, () => {
      setIsMember(false);
    });
    setLeavingId(null);
  }, [handleLeaveGroup]);

  const handleEdit = useCallback(() => {
    handleOpenEditModal();
  }, [handleOpenEditModal]);

  const handleEditSubmit = useCallback(async (updates: Parameters<typeof handleEditGroup>[1]) => {
    if (!selectedGroup) return;
    await handleEditGroup(selectedGroup.id, updates);
    handleCloseEditModal();
  }, [selectedGroup, handleEditGroup, handleCloseEditModal]);

  const canDelete = selectedGroup ? (isAdmin || selectedGroup.creator_id === userId) : false;

  return {
    showCreateModal,
    handleOpenCreateModal,
    handleCloseCreateModal,
    showEditModal,
    handleOpenEditModal,
    handleCloseEditModal,
    selectedGroupId,
    selectedGroup,
    isMember,
    joiningId,
    leavingId,
    majors,
    classes: CLASSES,
    isAdmin,
    handleCreateGroup,
    handleOpenDetails,
    handleCloseDetails,
    handleJoin,
    handleLeave,
    handleEdit,
    handleEditSubmit,
    handleDelete,
    handleGetCoursesByMajor,
    canDelete,
    groups,
    loading,
    error,
    filters,
    updateFilter,
    clearFilters,
    courses,
    reload,
    onSearchChange,
  } as const;
}
