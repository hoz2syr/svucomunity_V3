import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useStudyGroupsPage } from '@/src/features/study-groups/src/hooks/useStudyGroupsPage';

const mockUseStudyGroups = vi.fn();
const mockUseStudyGroupsActions = vi.fn();

const studyGroupService = vi.hoisted(() => ({
  checkIsAdmin: vi.fn(),
  checkMembership: vi.fn(),
  getAvailableMajors: vi.fn(),
}));

vi.mock('@/src/features/study-groups/src/hooks/useStudyGroups', () => ({
  useStudyGroups: (userId: string | undefined) => mockUseStudyGroups(userId),
}));

vi.mock('@/src/features/study-groups/src/hooks/useStudyGroupsActions', () => ({
  useStudyGroupsActions: (reload: () => Promise<void>) => mockUseStudyGroupsActions(reload),
}));

vi.mock('@/src/features/study-groups/src/core/services', () => ({
  studyGroupService,
}));

const baseStudyGroupsReturn = {
  groups: [],
  loading: false,
  error: null,
  filters: { search: '', major: '', course_code: '', class_number: '', status: 'all' } as any,
  updateFilter: vi.fn(),
  clearFilters: vi.fn(),
  courses: [],
  reload: vi.fn(async () => {}),
  onSearchChange: vi.fn(),
};

const baseActionsReturn = {
  currentUser: null,
  handleCreateGroup: vi.fn(),
  handleOpenDetails: vi.fn(),
  handleJoinGroup: vi.fn(),
  handleDeleteGroup: vi.fn(),
  handleGetCoursesByMajor: vi.fn(),
};

describe('useStudyGroupsPage hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseStudyGroups.mockReturnValue(baseStudyGroupsReturn);
    mockUseStudyGroupsActions.mockReturnValue(baseActionsReturn);
    (studyGroupService.checkIsAdmin as any).mockResolvedValue(false);
    (studyGroupService.checkMembership as any).mockResolvedValue(false);
    (studyGroupService.getAvailableMajors as any).mockResolvedValue(['CS', 'Engineering']);
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useStudyGroupsPage(undefined));
    expect(result.current.showCreateModal).toBe(false);
    expect(result.current.selectedGroupId).toBeNull();
    expect(result.current.isMember).toBe(false);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.majors.length).toBeGreaterThanOrEqual(0);
  });

  it('should open and close create modal', () => {
    const { result } = renderHook(() => useStudyGroupsPage(undefined));
    act(() => result.current.handleOpenCreateModal());
    expect(result.current.showCreateModal).toBe(true);
    act(() => result.current.handleCloseCreateModal());
    expect(result.current.showCreateModal).toBe(false);
  });

  it('should open details modal and check membership', async () => {
    const group = { id: '1', name: 'Group A', major: 'CS', creator_id: 'u1' } as any;
    mockUseStudyGroupsActions.mockReturnValue({
      ...baseActionsReturn,
      handleOpenDetails: vi.fn(async () => group),
    });

    const { result } = renderHook(() => useStudyGroupsPage('user-1'));

    await act(async () => {
      await result.current.handleOpenDetails('1', [group]);
    });

    expect(result.current.selectedGroupId).toBe('1');
    expect(result.current.selectedGroup).toEqual(group);
    expect(result.current.isMember).toBe(false);
  });

  it('should join group and update isMember', async () => {
    const joinGroup = vi.fn(async (_groupId: string, onComplete: () => void) => {
      onComplete();
    });
    mockUseStudyGroupsActions.mockReturnValue({
      ...baseActionsReturn,
      handleJoinGroup: joinGroup,
    });

    const { result } = renderHook(() => useStudyGroupsPage('user-1'));

    await act(async () => {
      await result.current.handleJoin('group-1');
    });

    expect(joinGroup).toHaveBeenCalledWith('group-1', expect.any(Function));
    expect(result.current.isMember).toBe(true);
  });

  it('should delete group and close modal', async () => {
    const deleteGroup = vi.fn((_group: any, onComplete: () => void) => {
      onComplete();
    });
    const group = { id: '1', name: 'Group A' } as any;
    const openDetails = vi.fn(async () => group);
    mockUseStudyGroupsActions.mockReturnValue({
      ...baseActionsReturn,
      handleOpenDetails: openDetails,
      handleDeleteGroup: deleteGroup,
    });

    const { result } = renderHook(() => useStudyGroupsPage('user-1'));
    await act(async () => {
      await result.current.handleOpenDetails('1', [group]);
    });
    await waitFor(() => {
      expect(result.current.selectedGroupId).toBe('1');
    });
    act(() => {
      result.current.handleDelete();
    });
    await waitFor(() => {
      expect(deleteGroup).toHaveBeenCalledWith(group, expect.any(Function));
      expect(result.current.selectedGroupId).toBeNull();
    });
  });

  it('should check admin status on mount', async () => {
    (studyGroupService.checkIsAdmin as any).mockResolvedValue(true);
    const { result } = renderHook(() => useStudyGroupsPage('user-1'));

    await waitFor(() => {
      expect(result.current.isAdmin).toBe(true);
    });
  });

  it('should pass through filter controls', () => {
    const updateFilter = vi.fn();
    const clearFilters = vi.fn();
    mockUseStudyGroups.mockReturnValue({
      ...baseStudyGroupsReturn,
      updateFilter,
      clearFilters,
    });

    const { result } = renderHook(() => useStudyGroupsPage(undefined));

    act(() => result.current.updateFilter('major', 'CS'));
    expect(updateFilter).toHaveBeenCalledWith('major', 'CS');

    act(() => result.current.clearFilters());
    expect(clearFilters).toHaveBeenCalled();
  });

  it('should determine canDelete correctly for admin', async () => {
    (studyGroupService.checkIsAdmin as any).mockResolvedValue(true);
    const openDetails = vi.fn(async (_groupId: string, _groups: any[]) => ({
      id: '1',
      name: 'Group A',
      creator_id: 'other-user',
    }));
    mockUseStudyGroupsActions.mockReturnValue({
      ...baseActionsReturn,
      handleOpenDetails: openDetails,
    });

    const { result } = renderHook(() => useStudyGroupsPage('user-1'));
    await act(async () => {
      await result.current.handleOpenDetails('1', []);
    });
    await waitFor(() => {
      expect(result.current.canDelete).toBe(true);
    });
  });

  it('should determine canDelete correctly for creator', async () => {
    (studyGroupService.checkIsAdmin as any).mockResolvedValue(false);
    const openDetails = vi.fn(async (_groupId: string, _groups: any[]) => ({
      id: '1',
      name: 'Group A',
      creator_id: 'user-1',
    }));
    mockUseStudyGroupsActions.mockReturnValue({
      ...baseActionsReturn,
      handleOpenDetails: openDetails,
    });

    const { result } = renderHook(() => useStudyGroupsPage('user-1'));
    await act(async () => {
      await result.current.handleOpenDetails('1', []);
    });
    await waitFor(() => {
      expect(result.current.canDelete).toBe(true);
    });
  });
});
