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
} from '../../services/studyGroup.supabase';

export {
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
};

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
};
