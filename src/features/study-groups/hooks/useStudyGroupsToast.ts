"use client";

import { useCallback } from 'react';
import { useToast } from '@/src/components/ui/Toast';

export function useStudyGroupsToast() {
  const { toast } = useToast();

  const notifyJoinSuccess = useCallback((groupName: string) => {
    toast(`تم الانضمام إلى "${groupName}" بنجاح`, 'success');
  }, [toast]);

  const notifyLeaveSuccess = useCallback((groupName: string) => {
    toast(`تم مغادرة "${groupName}"`, 'info');
  }, [toast]);

  const notifyCreateSuccess = useCallback((groupName: string) => {
    toast(`تم إنشاء مجموعة "${groupName}" بنجاح`, 'success');
  }, [toast]);

  const notifyDeleteSuccess = useCallback(() => {
    toast('تم حذف المجموعة بنجاح', 'success');
  }, [toast]);

  const notifyEditSuccess = useCallback(() => {
    toast('تم تحديث بيانات المجموعة بنجاح', 'success');
  }, [toast]);

  const notifyError = useCallback((message: string) => {
    toast(message || 'حدث خطأ، يرجى المحاولة مرة أخرى', 'error');
  }, [toast]);

  return {
    notifyJoinSuccess,
    notifyLeaveSuccess,
    notifyCreateSuccess,
    notifyDeleteSuccess,
    notifyEditSuccess,
    notifyError,
  };
}
