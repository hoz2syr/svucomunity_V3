import { describe, it, expect, vi, beforeEach } from 'vitest';
import { studyGroupService } from '@/src/features/study-groups/src/core/services';

vi.mock('@/src/features/study-groups/src/services/studyGroupsApi', () => ({
  getAllWithCreators: vi.fn(),
  getMyGroups: vi.fn(),
  createGroup: vi.fn(),
  joinGroup: vi.fn(),
  leaveGroup: vi.fn(),
  updateGroup: vi.fn(),
  deleteGroup: vi.fn(),
  getGroupMembers: vi.fn(),
  checkMembership: vi.fn(),
  checkIsAdmin: vi.fn(),
  getCoursesByMajor: vi.fn(),
  getAvailableMajors: vi.fn(),
}));

import {
  getAllWithCreators,
  getMyGroups,
  createGroup,
  joinGroup,
  leaveGroup,
  updateGroup,
  deleteGroup,
  getGroupMembers,
  checkMembership,
  checkIsAdmin,
  getCoursesByMajor,
  getAvailableMajors,
} from '@/src/features/study-groups/src/services/studyGroupsApi';

describe('studyGroupService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should delegate getAllWithCreators to Edge Function API', async () => {
    (getAllWithCreators as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    const result = await studyGroupService.getAllWithCreators();
    expect(getAllWithCreators).toHaveBeenCalledOnce();
    expect(result).toEqual([]);
  });

  it('should delegate getCoursesByMajor to Edge Function API', async () => {
    (getCoursesByMajor as ReturnType<typeof vi.fn>).mockResolvedValue([
      { code: 'CS101', name: 'Intro CS' },
    ]);
    const result = await studyGroupService.getCoursesByMajor('CS');
    expect(getCoursesByMajor).toHaveBeenCalledWith('CS');
    expect(result).toHaveLength(1);
  });

  it('should delegate getAvailableMajors to Edge Function API', async () => {
    (getAvailableMajors as ReturnType<typeof vi.fn>).mockResolvedValue(['CS', 'Engineering']);
    const result = await studyGroupService.getAvailableMajors();
    expect(getAvailableMajors).toHaveBeenCalledOnce();
    expect(result).toEqual(['CS', 'Engineering']);
  });

  it('should delegate joinGroup to Edge Function API', async () => {
    (joinGroup as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    await studyGroupService.joinGroup('group1', 'user1');
    expect(joinGroup).toHaveBeenCalledWith('group1', 'user1');
  });

  it('should delegate createGroup to Edge Function API', async () => {
    const newGroup = { id: '3', name: 'New Group' };
    (createGroup as ReturnType<typeof vi.fn>).mockResolvedValue(newGroup);
    const result = await studyGroupService.createGroup({ name: 'New Group' } as any);
    expect(createGroup).toHaveBeenCalledWith({ name: 'New Group' });
    expect(result).toEqual(newGroup);
  });

  it('should delegate deleteGroup to Edge Function API', async () => {
    (deleteGroup as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    await studyGroupService.deleteGroup('group1');
    expect(deleteGroup).toHaveBeenCalledWith('group1');
  });

  it('should delegate getGroupMembers to Edge Function API', async () => {
    (getGroupMembers as ReturnType<typeof vi.fn>).mockResolvedValue([
      { user_id: 'u1', joined_at: '2024-01-01' },
    ]);
    const result = await studyGroupService.getGroupMembers('group1');
    expect(getGroupMembers).toHaveBeenCalledWith('group1');
    expect(result).toHaveLength(1);
  });

  it('should delegate checkMembership to Edge Function API', async () => {
    (checkMembership as ReturnType<typeof vi.fn>).mockResolvedValue(true);
    const result = await studyGroupService.checkMembership('group1', 'user1');
    expect(checkMembership).toHaveBeenCalledWith('group1', 'user1');
    expect(result).toBe(true);
  });

  it('should delegate checkIsAdmin to Edge Function API', async () => {
    (checkIsAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);
    const result = await studyGroupService.checkIsAdmin('user1');
    expect(checkIsAdmin).toHaveBeenCalledWith('user1');
    expect(result).toBe(true);
  });

  it('should delegate leaveGroup to Edge Function API', async () => {
    (leaveGroup as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    await studyGroupService.leaveGroup('group1', 'user1');
    expect(leaveGroup).toHaveBeenCalledWith('group1', 'user1');
  });

  it('should delegate updateGroup to Edge Function API', async () => {
    const updated = { id: 'group1', name: 'Updated' };
    (updateGroup as ReturnType<typeof vi.fn>).mockResolvedValue(updated);
    const result = await studyGroupService.updateGroup('group1', { name: 'Updated' });
    expect(updateGroup).toHaveBeenCalledWith('group1', { name: 'Updated' });
    expect(result).toEqual(updated);
  });

  it('should delegate getMyGroups to Edge Function API', async () => {
    (getMyGroups as ReturnType<typeof vi.fn>).mockResolvedValue({ created: [], joined: [] });
    const result = await studyGroupService.getMyGroups('user1');
    expect(getMyGroups).toHaveBeenCalledWith('user1');
    expect(result).toEqual({ created: [], joined: [] });
  });
});