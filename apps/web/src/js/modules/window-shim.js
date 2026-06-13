import { isLoggedIn, getCurrentUser, saveUserSession, clearUserSession, updateUserData } from './core.js';
import { initSupabase, getDb, verifySessionWithServer } from './config.js';
import { showToast, openModal, closeModal, logout, getCategoryLabel, getYearLabel, getCurrentLang, COUNTRIES } from './shared.js';
import { applyLanguage, initLang, t } from './i18n.js';

window.isLoggedIn = isLoggedIn;
window.getCurrentUser = getCurrentUser;
window.saveUserSession = saveUserSession;
window.clearUserSession = clearUserSession;
window.updateUserData = updateUserData;
window.initSupabase = initSupabase;
window.getDb = getDb;
window.verifySessionWithServer = verifySessionWithServer;
window.showToast = showToast;
window.openModal = openModal;
window.closeModal = closeModal;
window.logout = logout;
window.getCategoryLabel = getCategoryLabel;
window.getYearLabel = getYearLabel;
window.getCurrentLang = getCurrentLang;
window.COUNTRIES = COUNTRIES;
window.i18n = {
  t,
  getLang: getCurrentLang,
  toggleLang: applyLanguage,
  initLang,
  applyLanguage,
};
