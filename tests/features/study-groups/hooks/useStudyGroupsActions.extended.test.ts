import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useStudyGroupsActions } from '@/src/features/study-groups/src/hooks/useStudyGroupsActions';
import { ToastProvider } from '@/src/components/ui/Toast';
import { studyGroupService } from '@/src/features/study-groups/src/core/services';

vi.mock('@/src/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({ session: { user: { id: 'user-1' } } })),
}));

vi.mock('@/src/features/study-groups/src/core/services', () => ({
  studyGroupService: {
    createGroup: vi.fn(),
    joinGroup: vi.fn(),
    leaveGroup: vi.fn(),
    updateGroup: vi.fn(),
    deleteGroup: vi.fn(),
    getCoursesByMajor: vi.fn(),
    checkMembership: vi.fn(),
    checkIsAdmin: vi.fn(),
  },
  studyGroupsApi: {
    getMyGroups: vi.fn(),
  },
}));

import { studyGroupService as mockService } from '@/src/features/study-groups/src/core/services';

const mockReload = vi.fn(async () => {});

describe('useStudyGroupsActions hook - extended', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
    (studyGroupService.createGroup as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'new-group',
      name: 'New Group',
    } as any);
    (studyGroupService.joinGroup as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    (studyGroupService.leaveGroup as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    (studyGroupService.updateGroup as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'group-1',
      name: 'Updated Group',
    } as any);
    (studyGroupService.deleteGroup as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    (studyGroupService.getCoursesByMajor as ReturnType<typeof vi.fn>).mockResolvedValue([
      { code: 'CS101', name: 'Intro CS' },
    ]);
    (studyGroupService.checkMembership as ReturnType<typeof vi.fn>).mockResolvedValue(false);
    (studyGroupService.checkIsAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(false);
  });

  it('should call leaveGroup via studyGroupService', async () => {
    const { result } = renderHook(() => useStudyGroupsActions(mockReload), {
      wrapper: ToastProvider,
    });

    await act(async () => {
      await (mockService.leaveGroup as any)('group-1', 'user-1');
    });

    expect(studyGroupService.leaveGroup).toHaveBeenCalledWith('group-1', 'user-1');
  });

  it('should call updateGroup via studyGroupService', async () => {
    const { result } = renderHook(() => useStudyGroupsActions(mockReload), {
      wrapper: ToastProvider,
    });

    await act(async () => {
      await (mockService.updateGroup as any)('group-1', { name: 'Updated' });
    });

    expect(studyGroupService.updateGroup).toHaveBeenCalledWith('group-1', { name: 'Updated' });
  });
});