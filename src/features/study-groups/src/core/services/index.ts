import {
  getAllWithCreators as getAllWithCreatorsRaw,
  getCreators as getCreatorsRaw,
  getCoursesByMajor as getCoursesByMajorRaw,
  getAvailableMajors as getAvailableMajorsRaw,
  joinGroup as joinGroupRaw,
  createGroup as createGroupRaw,
  deleteGroup as deleteGroupRaw,
  getGroupMembers as getGroupMembersRaw,
  checkMembership as checkMembershipRaw,
  checkIsAdmin as checkIsAdminRaw,
  leaveGroup as leaveGroupRaw,
  updateGroup as updateGroupRaw,
  getMyGroups as getMyGroupsRaw,
  reactivateGroup as reactivateGroupRaw,
  type ServiceResult,
  type StudyGroup,
  type Course,
  type GroupMember,
} from '../../../services/studyGroup.supabase';

const throwOnError = <T>(result: ServiceResult<T>): T => {
  if (result.error) throw new Error(result.error.message);
  return result.data as T;
};

export async function getAllWithCreators(): Promise<StudyGroup[]> {
  return throwOnError(await getAllWithCreatorsRaw());
}

export async function getCreators(userIds: string[]): Promise<Record<string, { first_name: string; last_name: string; username: string }>> {
  return throwOnError(await getCreatorsRaw(userIds));
}

export async function getCoursesByMajor(major: string): Promise<Course[]> {
  return throwOnError(await getCoursesByMajorRaw(major));
}

export async function getAvailableMajors(): Promise<string[]> {
  return throwOnError(await getAvailableMajorsRaw());
}

export async function joinGroup(groupId: string, userId: string): Promise<void> {
  return throwOnError(await joinGroupRaw(groupId, userId));
}

export async function createGroup(groupData: Parameters<typeof createGroupRaw>[0]): Promise<StudyGroup> {
  return throwOnError(await createGroupRaw(groupData));
}

export async function deleteGroup(groupId: string): Promise<void> {
  return throwOnError(await deleteGroupRaw(groupId));
}

  export async function getGroupMembers(groupId: string): Promise<GroupMember[]> {
    return throwOnError(await getGroupMembersRaw(groupId));
  }

export async function checkMembership(groupId: string, userId: string): Promise<boolean> {
  return throwOnError(await checkMembershipRaw(groupId, userId));
}

export async function checkIsAdmin(userId: string): Promise<boolean> {
  return throwOnError(await checkIsAdminRaw(userId));
}

export async function leaveGroup(groupId: string, userId: string): Promise<void> {
  return throwOnError(await leaveGroupRaw(groupId, userId));
}

export async function updateGroup(groupId: string, updates: Parameters<typeof updateGroupRaw>[1]): Promise<StudyGroup> {
  return throwOnError(await updateGroupRaw(groupId, updates));
}

export async function getMyGroups(userId: string): Promise<{ created: StudyGroup[]; joined: StudyGroup[] }> {
  return throwOnError(await getMyGroupsRaw(userId));
}

export async function reactivateGroup(groupId: string): Promise<void> {
  return throwOnError(await reactivateGroupRaw(groupId));
}

export const studyGroupService = {
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
  reactivateGroup,
};
