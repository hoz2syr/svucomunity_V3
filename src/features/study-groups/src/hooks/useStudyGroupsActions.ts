"use client";

import { useCallback } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { studyGroupService } from '../core/services';
import { useStudyGroupsToast } from './useStudyGroupsToast';
import type { StudyGroup, Course } from '../types';

export function useStudyGroupsActions(reload: () => Promise<void>) {
  const { session, profile } = useAuth();
  const userId = session?.user?.id;
  const { notifyError, notifyLeaveSuccess, notifyEditSuccess, notifyCreateSuccess, notifyDeleteSuccess } = useStudyGroupsToast();

  const handleCreateGroup = useCallback(async (data: {
    name: string;
    course_name: string;
    course_code: string;
    class_number: string;
    major: string;
    max_members: number;
    whatsapp_link: string;
    group_link?: string;
  }) => {
    if (!userId) return;
    try {
      await studyGroupService.createGroup({
        ...data,
        doctor_name: '',
        creator_id: userId,
        creator_name: profile?.full_name || profile?.username || 'مستخدم',
      });
      notifyCreateSuccess(data.name);
      reload();
    } catch (err) {
      console.error('Failed to create:', err);
      notifyError(err instanceof Error ? err.message : 'فشل إنشاء المجموعة');
    }
  }, [userId, profile, reload, notifyCreateSuccess, notifyError]);

  const handleOpenDetails = useCallback(async (groupId: string, groups: StudyGroup[]) => {
    const group = groups.find((g) => String(g.id) === String(groupId));
    if (!group) return;
    return group;
  }, []);

  const handleJoinGroup = useCallback(async (groupId: string, onJoinComplete: () => void) => {
    if (!userId) return;
    try {
      await studyGroupService.joinGroup(groupId, userId);
      onJoinComplete();
      reload();
    } catch (err) {
      console.error('Failed to join:', err);
      notifyError(err instanceof Error ? err.message : 'فشل الانضمام');
    }
  }, [userId, reload, notifyError]);

  const handleLeaveGroup = useCallback(async (groupId: string, groupName: string, onLeaveComplete: () => void) => {
    if (!userId) return;
    try {
      await studyGroupService.leaveGroup(groupId, userId);
      notifyLeaveSuccess(groupName);
      onLeaveComplete();
      reload();
    } catch (err) {
      console.error('Failed to leave:', err);
      notifyError(err instanceof Error ? err.message : 'فشل مغادرة المجموعة');
    }
  }, [userId, reload, notifyError, notifyLeaveSuccess]);

  const handleEditGroup = useCallback(async (groupId: string, updates: {
    name?: string;
    course_name?: string;
    course_code?: string;
    class_number?: string;
    doctor_name?: string;
    major?: string;
    max_members?: number;
    whatsapp_link?: string;
    group_link?: string;
  }) => {
    if (!groupId) return;
    try {
      await studyGroupService.updateGroup(groupId, updates);
      notifyEditSuccess();
      reload();
    } catch (err) {
      console.error('Failed to edit:', err);
      notifyError(err instanceof Error ? err.message : 'فشل تحديث المجموعة');
    }
  }, [reload, notifyError, notifyEditSuccess]);

  const handleDeleteGroup = useCallback(async (selectedGroup: StudyGroup | null, onComplete: () => void) => {
    if (!selectedGroup) return;
    try {
      await studyGroupService.deleteGroup(selectedGroup.id);
      notifyDeleteSuccess();
      onComplete();
      reload();
    } catch (err) {
      console.error('Failed to delete:', err);
      notifyError(err instanceof Error ? err.message : 'فشل حذف المجموعة');
    }
  }, [reload, notifyDeleteSuccess, notifyError]);

  const handleGetCoursesByMajor = useCallback(async (major: string): Promise<Course[]> => {
    return studyGroupService.getCoursesByMajor(major);
  }, []);

  return {
    userId,
    handleCreateGroup,
    handleOpenDetails,
    handleJoinGroup,
    handleLeaveGroup,
    handleEditGroup,
    handleDeleteGroup,
    handleGetCoursesByMajor,
  };
}
