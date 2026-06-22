export const STORAGE_KEY = 'svu_tests_db';
export const CURRENT_USER_KEY = 'svu_tests_current_user';
export const RATED_SESSIONS_KEY = 'svu_tests_rated_sessions';
export const PENDING_PREFIX = 'svu_tests_pending:';
export const SYNCED_PREFIX = 'svu_tests_synced:';

export const clearAllExamLocalData = (userId?: string): void => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(CURRENT_USER_KEY);
  localStorage.removeItem(RATED_SESSIONS_KEY);
  if (userId) {
    localStorage.removeItem(`${PENDING_PREFIX}${userId}`);
    localStorage.removeItem(`${SYNCED_PREFIX}${userId}`);
  }
};
