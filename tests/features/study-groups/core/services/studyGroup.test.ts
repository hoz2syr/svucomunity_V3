import { describe, it, expect, vi, beforeEach } from 'vitest';
import { studyGroupService } from '@/src/features/study-groups/src/core/services';

vi.mock('@/src/features/study-groups/src/services/studyGroup.supabase', () => ({
  getAllWithCreators: vi.fn(),
  getCoursesByMajor: vi.fn(),
  getAvailableMajors: vi.fn(),
  joinGroup: vi.fn(),
  createGroup: vi.fn(),
  deleteGroup: vi.fn(),
  getGroupMembers: vi.fn(),
  checkMembership: vi.fn(),
  checkIsAdmin: vi.fn(),
  getCreators: vi.fn(),
  getSupabase: vi.fn(),
  leaveGroup: vi.fn(),
  updateGroup: vi.fn(),
  getMyGroups: vi.fn(),
}));

import {
  getAllWithCreators,
  getCoursesByMajor,
  getAvailableMajors,
  joinGroup,
  createGroup,
  deleteGroup,
  getGroupMembers,
  checkMembership,
  checkIsAdmin,
  getSupabase,
  leaveGroup,
  updateGroup,
  getMyGroups,
} from '@/src/features/study-groups/src/services/studyGroup.supabase';

describe('studyGroupService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should delegate getAllWithCreators to supabase module', async () => {
    (getAllWithCreators as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    const result = await studyGroupService.getAllWithCreators();
    expect(getAllWithCreators).toHaveBeenCalledOnce();
    expect(result).toEqual([]);
  });

  it('should delegate getCoursesByMajor to supabase module', async () => {
    (getCoursesByMajor as ReturnType<typeof vi.fn>).mockResolvedValue([
      { code: 'CS101', name: 'Intro CS' },
    ]);
    const result = await studyGroupService.getCoursesByMajor('CS');
    expect(getCoursesByMajor).toHaveBeenCalledWith('CS');
    expect(result).toHaveLength(1);
  });

  it('should delegate getAvailableMajors to supabase module', async () => {
    (getAvailableMajors as ReturnType<typeof vi.fn>).mockResolvedValue(['CS', 'Engineering']);
    const result = await studyGroupService.getAvailableMajors();
    expect(getAvailableMajors).toHaveBeenCalledOnce();
    expect(result).toEqual(['CS', 'Engineering']);
  });

  it('should delegate joinGroup to supabase module', async () => {
    (joinGroup as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    await studyGroupService.joinGroup('group1', 'user1');
    expect(joinGroup).toHaveBeenCalledWith('group1', 'user1');
  });

  it('should delegate createGroup to supabase module', async () => {
    const newGroup = { id: '3', name: 'New Group' };
    (createGroup as ReturnType<typeof vi.fn>).mockResolvedValue(newGroup);
    const result = await studyGroupService.createGroup({ name: 'New Group' } as any);
    expect(createGroup).toHaveBeenCalledWith({ name: 'New Group' });
    expect(result).toEqual(newGroup);
  });

  it('should delegate deleteGroup to supabase module', async () => {
    (deleteGroup as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    await studyGroupService.deleteGroup('group1');
    expect(deleteGroup).toHaveBeenCalledWith('group1');
  });

  it('should delegate getGroupMembers to supabase module', async () => {
    (getGroupMembers as ReturnType<typeof vi.fn>).mockResolvedValue([
      { user_id: 'u1', joined_at: '2024-01-01' },
    ]);
    const result = await studyGroupService.getGroupMembers('group1');
    expect(getGroupMembers).toHaveBeenCalledWith('group1');
    expect(result).toHaveLength(1);
  });

  it('should delegate checkMembership to supabase module', async () => {
    (checkMembership as ReturnType<typeof vi.fn>).mockResolvedValue(true);
    const result = await studyGroupService.checkMembership('group1', 'user1');
    expect(checkMembership).toHaveBeenCalledWith('group1', 'user1');
    expect(result).toBe(true);
  });

  it('should delegate checkIsAdmin to supabase module', async () => {
    (checkIsAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(true);
    const result = await studyGroupService.checkIsAdmin('user1');
    expect(checkIsAdmin).toHaveBeenCalledWith('user1');
    expect(result).toBe(true);
  });

  it('should expose getSupabase on studyGroupService', async () => {
    const mockClient = { from: vi.fn() };
    (getSupabase as ReturnType<typeof vi.fn>).mockReturnValue(mockClient as any);
    const client = studyGroupService.getSupabase();
    expect(getSupabase).toHaveBeenCalledOnce();
    expect(client).toBe(mockClient);
  });

  it('should delegate leaveGroup to supabase module', async () => {
    (leaveGroup as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    await (studyGroupService as any).leaveGroup('group1', 'user1');
    expect(leaveGroup).toHaveBeenCalledWith('group1', 'user1');
  });

  it('should delegate updateGroup to supabase module', async () => {
    const updated = { id: 'group1', name: 'Updated' };
    (updateGroup as ReturnType<typeof vi.fn>).mockResolvedValue(updated);
    const result = await (studyGroupService as any).updateGroup('group1', { name: 'Updated' });
    expect(updateGroup).toHaveBeenCalledWith('group1', { name: 'Updated' });
    expect(result).toEqual(updated);
  });

  it('should delegate getMyGroups to supabase module', async () => {
    (getMyGroups as ReturnType<typeof vi.fn>).mockResolvedValue({ created: [], joined: [] });
    const result = await (studyGroupService as any).getMyGroups('user1');
    expect(getMyGroups).toHaveBeenCalledWith('user1');
    expect(result).toEqual({ created: [], joined: [] });
  });
});
