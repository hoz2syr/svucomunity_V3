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
  getCreators,
  getSupabase,
} from '../../services/studyGroup.supabase';

export {
  getAllWithCreators,
  getCoursesByMajor,
  getAvailableMajors,
  joinGroup,
  createGroup,
  deleteGroup,
  getGroupMembers,
  checkMembership,
  checkIsAdmin,
  getCreators,
  getSupabase,
};

export const studyGroupService = {
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
};
