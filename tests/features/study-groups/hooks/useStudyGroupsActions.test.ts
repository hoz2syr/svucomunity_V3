import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ToastProvider } from '@/src/components/ui/Toast';
import { useStudyGroupsActions } from '@/src/features/study-groups/src/hooks/useStudyGroupsActions';

vi.mock('@/src/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({ session: { user: { id: 'user-1' } } })),
}));

vi.mock('@/src/features/study-groups/src/core/services', () => ({
  studyGroupService: {
    createGroup: vi.fn(),
    joinGroup: vi.fn(),
    deleteGroup: vi.fn(),
    getCoursesByMajor: vi.fn(),
    checkMembership: vi.fn(),
  },
}));

import { studyGroupService } from '@/src/features/study-groups/src/core/services';

const mockReload = vi.fn(async () => {});

describe('useStudyGroupsActions hook', () => {
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
    (studyGroupService.deleteGroup as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    (studyGroupService.getCoursesByMajor as ReturnType<typeof vi.fn>).mockResolvedValue([
      { code: 'CS101', name: 'Intro CS' },
    ]);
    (studyGroupService.checkMembership as ReturnType<typeof vi.fn>).mockResolvedValue(false);
  });

  it('should return userId from session', () => {
    const { result } = renderHook(() => useStudyGroupsActions(mockReload), {
      wrapper: ToastProvider,
    });
    expect(result.current.userId).toBe('user-1');
  });

  it('should create group and reload', async () => {
    const { result } = renderHook(() => useStudyGroupsActions(mockReload), {
      wrapper: ToastProvider,
    });

    await act(async () => {
      await result.current.handleCreateGroup({
        name: 'Test Group',
        course_name: 'Math',
        course_code: 'MATH101',
        class_number: 'C1',
        major: 'CS',
        max_members: 5,
        whatsapp_link: 'https://wa.me/1',
      });
    });

    expect(studyGroupService.createGroup).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Group',
        course_code: 'MATH101',
        major: 'CS',
        creator_id: 'user-1',
      })
    );
    expect(mockReload).toHaveBeenCalled();
  });

  it('should find group by id from groups array', async () => {
    const { result } = renderHook(() => useStudyGroupsActions(mockReload), {
      wrapper: ToastProvider,
    });
    const groups = [
      { id: '1', name: 'Group A' },
      { id: '2', name: 'Group B' },
    ] as any;

    const found = await result.current.handleOpenDetails('2', groups);
    expect(found).toEqual({ id: '2', name: 'Group B' });
  });

  it('should return undefined when group not found', async () => {
    const { result } = renderHook(() => useStudyGroupsActions(mockReload), {
      wrapper: ToastProvider,
    });
    const groups = [{ id: '1', name: 'Group A' }] as any;

    const found = await result.current.handleOpenDetails('999', groups);
    expect(found).toBeUndefined();
  });

  it('should join group and reload', async () => {
    const { result } = renderHook(() => useStudyGroupsActions(mockReload), {
      wrapper: ToastProvider,
    });
    const onJoinComplete = vi.fn();

    await act(async () => {
      await result.current.handleJoinGroup('group-1', onJoinComplete);
    });

    expect(studyGroupService.joinGroup).toHaveBeenCalledWith('group-1', 'user-1');
    expect(onJoinComplete).toHaveBeenCalled();
    expect(mockReload).toHaveBeenCalled();
  });

  it('should delete group and reload', async () => {
    const { result } = renderHook(() => useStudyGroupsActions(mockReload), {
      wrapper: ToastProvider,
    });
    const onComplete = vi.fn();

    await act(async () => {
      await result.current.handleDeleteGroup({ id: 'group-1', name: 'Test' } as any, onComplete);
    });

    expect(studyGroupService.deleteGroup).toHaveBeenCalledWith('group-1');
    expect(onComplete).toHaveBeenCalled();
    expect(mockReload).toHaveBeenCalled();
  });

  it('should get courses by major', async () => {
    const { result } = renderHook(() => useStudyGroupsActions(mockReload), {
      wrapper: ToastProvider,
    });

    let courses: any;
    await act(async () => {
      courses = await result.current.handleGetCoursesByMajor('CS');
    });

    expect(studyGroupService.getCoursesByMajor).toHaveBeenCalledWith('CS');
    expect(courses).toHaveLength(1);
    expect(courses[0].code).toBe('CS101');
  });

  it('should expose currentUser when stored in localStorage', async () => {
    localStorage.setItem(
      'currentUser',
      JSON.stringify({
        major: 'CS',
        first_name: 'Test',
        last_name: 'User',
        username: 'testuser',
        id: 'user-1',
      })
    );

    const { result } = renderHook(() => useStudyGroupsActions(mockReload), {
      wrapper: ToastProvider,
    });

    await waitFor(() => {
      expect(result.current.currentUser).toBeDefined();
      expect(result.current.currentUser?.major).toBe('CS');
    });
  });

  it('should have null currentUser when not in localStorage', async () => {
    const { result } = renderHook(() => useStudyGroupsActions(mockReload), {
      wrapper: ToastProvider,
    });

    await waitFor(() => {
      expect(result.current.currentUser).toBeNull();
    });
  });
});
