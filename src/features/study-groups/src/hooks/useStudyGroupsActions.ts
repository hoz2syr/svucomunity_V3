"use client";

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { studyGroupService } from '../core/services';
import { useStudyGroupsToast } from './useStudyGroupsToast';
import type { StudyGroup, Course } from '../types';

export function useStoredUser() {
  const [currentUser, setCurrentUser] = useState<{
    major?: string;
    first_name?: string;
    last_name?: string;
    username?: string;
    id: string;
  } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof localStorage === 'undefined') return;
    try {
      const stored = localStorage.getItem('currentUser');
      if (stored) setCurrentUser(JSON.parse(stored));
    } catch {
      // ignore parse errors
    }
  }, []);

  return { currentUser, mounted };
}

export function useStudyGroupsActions(reload: () => Promise<void>) {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const { currentUser, mounted } = useStoredUser();
  const { notifyError, notifyLeaveSuccess, notifyEditSuccess } = useStudyGroupsToast();

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
    await studyGroupService.createGroup({
      ...data,
      doctor_name: '',
      creator_id: userId,
      creator_name: [
        currentUser?.first_name,
        currentUser?.last_name,
        currentUser?.username,
      ].filter(Boolean).join(' ') || 'مستخدم',
    });
    reload();
  }, [userId, currentUser, reload]);

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
  }, groupName: string) => {
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
    await studyGroupService.deleteGroup(selectedGroup.id);
    onComplete();
    reload();
  }, [reload]);

  const handleGetCoursesByMajor = useCallback(async (major: string): Promise<Course[]> => {
    return studyGroupService.getCoursesByMajor(major);
  }, []);

  return {
    userId,
    currentUser,
    mounted,
    handleCreateGroup,
    handleOpenDetails,
    handleJoinGroup,
    handleLeaveGroup,
    handleEditGroup,
    handleDeleteGroup,
    handleGetCoursesByMajor,
  };
}
