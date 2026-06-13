import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../services/supabase';
import type { Course } from '../services/types';

export interface JoinGroupOptions {
  groupId: string;
  userId: string;
  currentMembers: string[];
  onError: (message: string) => void;
}

export interface LeaveGroupOptions {
  groupId: string;
  userId: string;
  currentMembers: string[];
  onError: (message: string) => void;
}

export interface CreateGroupOptions {
  course: Course;
  userId: string;
  onError: (message: string) => void;
}

export interface UseGroupActionsReturn {
  joinGroup: (options: JoinGroupOptions) => Promise<void>;
  leaveGroup: (options: LeaveGroupOptions) => Promise<void>;
  createGroup: (options: CreateGroupOptions) => Promise<void>;
  isAnyLoading: boolean;
  isJoining: boolean;
  isLeaving: boolean;
  isCreating: boolean;
}

export function useGroupActions(): UseGroupActionsReturn {
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const joinGroup = useCallback(async ({ groupId, userId, currentMembers, onError }: JoinGroupOptions) => {
    if (isJoining) return;
    if (currentMembers.includes(userId)) return;
    setIsJoining(true);
    try {
      const newMembers = [...currentMembers, userId];
      const { error: updateError } = await supabase
        .from('study_groups')
        .update({ members: newMembers })
        .eq('id', groupId);

      if (updateError) throw updateError;
    } catch (err) {
      console.error('[Supabase] Error joining group:', err);
      onError(err instanceof Error ? err.message : 'Failed to join group.');
    } finally {
      setIsJoining(false);
    }
  }, [isJoining]);

  const leaveGroup = useCallback(async ({ groupId, userId, currentMembers, onError }: LeaveGroupOptions) => {
    if (isLeaving) return;
    setIsLeaving(true);
    try {
      const updatedMembers = currentMembers.filter(id => id !== userId);
      const { error: updateError } = await supabase
        .from('study_groups')
        .update({ members: updatedMembers })
        .eq('id', groupId);

      if (updateError) throw updateError;
    } catch (err) {
      console.error('[Supabase] Error leaving group:', err);
      onError(err instanceof Error ? err.message : 'Failed to leave group.');
    } finally {
      setIsLeaving(false);
    }
  }, [isLeaving]);

  const createGroup = useCallback(async ({ course, userId, onError }: CreateGroupOptions) => {
    if (isCreating) return;
    setIsCreating(true);
    try {
      const groupName = `${course.code} Study Group`;
      const { error: insertError } = await supabase
        .from('study_groups')
        .insert({
          course_code: course.code,
          course_name: course.name,
          name: groupName,
          creator_id: userId,
          members: [userId],
        });

      if (insertError) throw insertError;
    } catch (err) {
      console.error('[Supabase] Error creating group:', err);
      onError(err instanceof Error ? err.message : 'Failed to create group.');
    } finally {
      setIsCreating(false);
    }
  }, [isCreating]);

  const isAnyLoading = isJoining || isLeaving || isCreating;

  return { joinGroup, leaveGroup, createGroup, isAnyLoading, isJoining, isLeaving, isCreating };
}
