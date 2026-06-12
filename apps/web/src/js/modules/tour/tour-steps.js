import { t as i18nT } from '../i18n.js';

export const STORAGE_KEY = 'svu_tour_v8_done';

export const STEPS = [
  { target: null, titleKey: 'tour_welcome_title', descKey: 'tour_welcome_desc', centered: true },
  { target: '[data-tour="user-card"]', titleKey: 'tour_usercard_title', descKey: 'tour_usercard_desc' },
  { target: '[data-tour="groups-card"]', titleKey: 'tour_groups_title', descKey: 'tour_groups_desc' },
  { target: '[data-tour="materials-card"]', titleKey: 'tour_materials_title', descKey: 'tour_materials_desc' },
  { target: '[data-tour="schedule-card"]', titleKey: 'tour_schedule_title', descKey: 'tour_schedule_desc' },
  { target: '[data-tour="profile-card"]', titleKey: 'tour_profile_title', descKey: 'tour_profile_desc' },
  { target: '[data-tour="forum-card"]', titleKey: 'tour_forum_title', descKey: 'tour_forum_desc' },
];

export function tr(key) {
  return i18nT(key);
}
