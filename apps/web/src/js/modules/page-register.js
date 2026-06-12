/**
 * SVU Community — Register Page
 */

import { escapeHtml, handleLoginError, handleRegisterError } from './core.js';
import {
  COUNTRIES,
  getCountryName,
  showToast,
  loadSVUCourses,
  getMajorsList,
  getCoursesByMajor,
  resolveMajorKey,
  matchMajor,
} from '../shared.js';
import { initLang, getLang, applyLanguage } from '../i18n.js';
import {
  initSupabase,
  getDb,
  verifySessionWithServer,
} from '../config.js';

export {
  MAJORS,
  state,
  resolveDb,
  getCurrentLang,
  fetchMajors,
} from './page-register/register-state.js';
export {
  PASSWORD_MIN,
  PASSWORD_MAX,
  STR_COLOR,
  STR_LABEL_KEY,
  tI18n,
  i18nT,
  validateUsername,
  validateMajor,
  validatePhone,
  validatePassword,
  formatFieldError,
  calcStrength,
  localizeI18n,
} from './page-register/validation.js';
export {
  buildPhone,
  buildAuthPayload,
  submitRegisterForm,
} from './page-register/register-api.js';
export {
  refreshThemeIcons,
  renderList,
  chooseCountry,
  openMenu,
  closeMenu,
  toggleMenu,
  updateHint,
  fmtPhone,
  checkPhone,
  renderMajors,
  selectMajor,
  openMajorMenu,
  closeMajorMenu,
  toggleMajorMenu,
  showStrength,
  makeToggle,
  setFormLoading,
  renderLoadingSkeleton,
} from './page-register/register-ui.js';

import { initRegisterPage } from './page-register/register-handlers.js';

document.addEventListener('DOMContentLoaded', async () => {
  await initRegisterPage();
});
