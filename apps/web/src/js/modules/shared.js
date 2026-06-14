/**
 * SVU Community — Shared utilities and cross-page helpers
 */
import { getCsrfToken, getCsrfHeaderName } from './csrf.js';
import { getDb } from './config.js';
import { escapeHtml, storageGet } from './core.js';

let coursesData = null;
let coursesFailedAt = 0;
const COURSES_RETRY_MS = 30_000;
const _toastTimers = new Map();
let _toastId = 0;
const log = {
  debug: (...args) => console.debug('[Shared]', ...args),
  warn: (...args) => console.warn('[Shared]', ...args),
  error: (...args) => console.error('[Shared]', ...args),
};

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast') || createToast();
  const content = document.getElementById('toastContent') || toast.firstElementChild;

  if (!content) return;

  const safeMessage = escapeHtml(message);
  content.textContent = safeMessage;
  content.className =
    (type === 'success' ? 'bg-green-600' : 'bg-red-600') +
    ' text-white px-6 py-3 rounded-xl shadow-2xl border text-center font-medium';

  content.setAttribute('role', 'status');
  content.setAttribute('aria-live', 'polite');

  toast.classList.remove('opacity-0', 'translate-y-4');
  toast.classList.add('opacity-100', 'translate-y-0');

  const key = `toastMsg:${++_toastId}`;
  clearTimeout(_toastTimers.get(key));

  const timer = setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-4');
    toast.classList.remove('opacity-100', 'translate-y-0');
    _toastTimers.delete(key);
  }, 3500);

  _toastTimers.set(key, timer);
}

async function loadSVUCourses() {
  const now = Date.now();
  if (coursesData) return coursesData;
  if (coursesFailedAt && now - coursesFailedAt < COURSES_RETRY_MS) {
    log.debug('[Courses] Returning cached failure; retry after', Math.ceil((COURSES_RETRY_MS - (now - coursesFailedAt)) / 1000), 's');
    return {};
  }

  const paths = ['./svu_courses.json', 'svu_courses.json'];
  for (const path of paths) {
    try {
      const res = await fetch(path, {
        headers: getCsrfHeaders(),
      });
      if (!res.ok) continue;

      const contentLength = res.headers.get('content-length');
      if (contentLength && parseInt(contentLength, 10) > MAX_JSON_SIZE) {
        log.warn('[Courses] File exceeds size limit:', path, contentLength);
        continue;
      }

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json') && !contentType.includes('text/json')) {
        const text = await res.text();
        if (text.trimStart().startsWith('<')) continue;
        coursesData = JSON.parse(text);
      } else {
        coursesData = await res.json();
      }

      coursesFailedAt = 0;
      return coursesData;
    } catch (err) {
      log.warn('[Courses] Failed to load from', path, ':', err);
    }
  }

  coursesFailedAt = now;
  log.error('[Courses] svu_courses.json not found. Check deployment.');
  return {};
}

async function getMajorsList() {
  return Object.keys(await loadSVUCourses());
}

async function getCoursesByMajor(majorKey) {
  const data = await loadSVUCourses();
  if (data[majorKey]) return data[majorKey];
  const found = Object.keys(data).find((k) => k.toUpperCase().startsWith(majorKey.toUpperCase()));
  return found ? data[found] : [];
}

async function resolveMajorKey(majorCode) {
  const data = await loadSVUCourses();
  if (data[majorCode]) return majorCode;
  const found = Object.keys(data).find((k) => k.toUpperCase().startsWith(majorCode.toUpperCase()));
  return found || majorCode;
}

function matchMajor(filterMajor, groupMajor) {
  if (!filterMajor || !groupMajor) return true;
  if (filterMajor === groupMajor) return true;
  const filterCode = filterMajor.split(/[\s(]/)[0].toUpperCase();
  const groupCode = groupMajor.split(/[\s(]/)[0].toUpperCase();
  return filterCode === groupCode;
}

function createToast() {
  const toast = document.createElement('div');
  toast.id = 'toast';
  toast.className =
    'fixed bottom-4 left-1/2 -translate-x-1/2 transform transition-all duration-300 z-[9999] opacity-0 translate-y-4';
  toast.style.minWidth = '250px';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');

  const content = document.createElement('div');
  content.id = 'toastContent';
  content.className = 'text-white px-6 py-3 rounded-xl shadow-2xl border text-center font-medium';

  toast.appendChild(content);
  document.body.appendChild(toast);
  return toast;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const hours = Math.floor((now - date) / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  const isAr = typeof getCurrentLang === 'function' ? getCurrentLang().startsWith('ar') : true;

  if (hours < 1) return isAr ? 'الآن' : 'Just now';
  if (hours < 24) return isAr ? `منذ ${hours} ساعة` : `${hours}h ago`;
  if (days < 7) return isAr ? `منذ ${days} يوم` : `${days}d ago`;
  return date.toLocaleDateString(isAr ? 'ar' : 'en');
}

function timeAgo(dateStr) {
  return formatDate(dateStr);
}

function getCurrentLang() {
  return document.documentElement.lang || storageGet('svu_lang') || 'ar';
}

async function enrichCreators(groups, db) {
  if (!groups || groups.length === 0) return;
  if (!db) db = getDb();
  if (!db) return;

  const creatorIds = [];
  const seenIds = new Set();
  for (const g of groups) {
    const cid = g.creator_id;
    if (cid && !seenIds.has(cid)) {
      seenIds.add(cid);
      creatorIds.push(cid);
    }
  }

  if (creatorIds.length === 0) return;

  try {
    const { data } = await db.from('users').select('id, first_name, last_name, username').in('id', creatorIds);

    if (!data) return;
    const creatorMap = Object.fromEntries(data.map((c) => [c.id, c]));
    for (const g of groups) {
      const creator = creatorMap[g.creator_id];
      g._creatorFullName = creator
        ? [creator.first_name, creator.last_name].filter(Boolean).join(' ') || creator.username || 'مستخدم'
        : 'مستخدم';
      g._creatorUsername = creator ? creator.username || '' : '';
    }
  } catch {
    // ignore enrichment errors
  }
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    modal.setAttribute('aria-hidden', 'false');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    modal.setAttribute('aria-hidden', 'true');
  }
}

async function logout() {
  try {
    const db = getDb();
    if (db) await db.auth.signOut();
  } catch {
    // ignore logout errors
  }

  clearUserSession();
  showToast('تم تسجيل الخروج بنجاح', 'success');
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 1000);
}

function getCategoryLabel(category) {
  if (!category) return '';
  const isAr = getCurrentLang().startsWith('ar');
  const labels = {
    Networking: isAr ? 'شبكات' : 'Networking',
    Programming: isAr ? 'برمجة' : 'Programming',
    Databases: isAr ? 'قواعد بيانات' : 'Databases',
    Design: isAr ? 'تصميم' : 'Design',
    Security: isAr ? 'أمن سيبراني' : 'Security',
    WebDev: isAr ? 'تطوير ويب' : 'Web Development',
    Mobile: isAr ? 'تطبيقات موبايل' : 'Mobile',
    AI: isAr ? 'ذكاء اصطناعي' : 'AI',
    DevOps: isAr ? 'عمليات' : 'DevOps',
  };
  return labels[category] || category;
}

function getYearLabel(year) {
  const isAr = getCurrentLang().startsWith('ar');
  return isAr ? `السنة ${year}` : `Year ${year}`;
}

function getUrlParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

/**
 * Debounce function calls by `delay` ms.
 * @template T
 * @param {(this: T, ...args: any[]) => void} fn
 * @param {number} [delay=300]
 * @returns {function(...args: any[]): void}
 */
function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

const COUNTRIES = [
  { code: 'SY', name: { ar: 'سوريا', en: 'Syria' }, dial: '+963', flag: '🇸🇾', localPfx: ['9'], minLen: 9, maxLen: 9 },
  { code: 'SA', name: { ar: 'السعودية', en: 'Saudi Arabia' }, dial: '+966', flag: '🇸🇦', localPfx: ['5'], minLen: 9, maxLen: 9 },
  { code: 'AE', name: { ar: 'الإمارات', en: 'UAE' }, dial: '+971', flag: '🇦🇪', localPfx: ['5'], minLen: 9, maxLen: 9 },
  { code: 'EG', name: { ar: 'مصر', en: 'Egypt' }, dial: '+20', flag: '🇪🇬', localPfx: ['1'], minLen: 10, maxLen: 10 },
  { code: 'JO', name: { ar: 'الأردن', en: 'Jordan' }, dial: '+962', flag: '🇯🇴', localPfx: ['7'], minLen: 9, maxLen: 9 },
  { code: 'LB', name: { ar: 'لبنان', en: 'Lebanon' }, dial: '+961', flag: '🇱🇧', localPfx: ['3', '7', '8'], minLen: 7, maxLen: 8 },
  { code: 'IQ', name: { ar: 'العراق', en: 'Iraq' }, dial: '+964', flag: '🇮🇶', localPfx: ['7'], minLen: 10, maxLen: 10 },
  { code: 'KW', name: { ar: 'الكويت', en: 'Kuwait' }, dial: '+965', flag: '🇰🇼', localPfx: ['5', '6', '9'], minLen: 8, maxLen: 8 },
  { code: 'TR', name: { ar: 'تركيا', en: 'Turkey' }, dial: '+90', flag: '🇹🇷', localPfx: ['5'], minLen: 10, maxLen: 10 },
  { code: 'US', name: { ar: 'الولايات المتحدة', en: 'USA' }, dial: '+1', flag: '🇺🇸', localPfx: [], minLen: 10, maxLen: 10 },
  { code: 'GB', name: { ar: 'بريطانيا', en: 'UK' }, dial: '+44', flag: '🇬🇧', localPfx: ['7'], minLen: 10, maxLen: 11 },
  { code: 'DE', name: { ar: 'ألمانيا', en: 'Germany' }, dial: '+49', flag: '🇩🇪', localPfx: ['15', '16', '17'], minLen: 10, maxLen: 11 },
];

/**
 * Get country display name in the current document language (Arabic fallback).
 * @param {{ name: { ar: string, en: string } | string }} country
 * @returns {string}
 */
function getCountryName(country) {
  const lang = getCurrentLang().startsWith('en') ? 'en' : 'ar';
  if (typeof country.name === 'object') {
    return country.name[lang] || country.name.ar || country.name.en || '';
  }
  return typeof country.name === 'string' ? country.name : '';
}

export {
  log,
  loadSVUCourses,
  getMajorsList,
  getCoursesByMajor,
  resolveMajorKey,
  matchMajor,
  showToast,
  formatDate,
  timeAgo,
  enrichCreators,
  openModal,
  closeModal,
  logout,
  getCategoryLabel,
  getYearLabel,
  getUrlParam,
  debounce,
  COUNTRIES,
  getCountryName,
  getCurrentLang,
};
