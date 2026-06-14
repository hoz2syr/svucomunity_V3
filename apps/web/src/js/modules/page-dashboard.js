/**
 * Dashboard Page Logic
 */
import { initializeTheme, isLoggedIn, getCurrentUser } from './core.js';
import { initSupabase, getDb, verifySessionWithServer } from './config.js';
import { showToast, logout } from './shared.js';
import { initLang } from './i18n.js';

function hideLoadingState() {
  const el = document.getElementById('loadingState');
  if (el) el.classList.add('hidden');
}

function showErrorState(message) {
  hideLoadingState();
  const loading = document.getElementById('loadingState');
  if (loading) {
    const title = document.createElement('div');
    title.className = 'text-center';
    title.innerHTML = '<div class="text-5xl mb-4">⚠️</div>';

    const errorText = document.createElement('p');
    errorText.className = 'text-red-400 mb-2';
    errorText.textContent = message || 'حدث خطأ';

    const loginLink = document.createElement('a');
    loginLink.href = 'login.html';
    loginLink.className = 'text-primary-400 underline';
    loginLink.textContent = 'تسجيل الدخول';

    title.appendChild(errorText);
    title.appendChild(loginLink);

    loading.innerHTML = '';
    loading.appendChild(title);
    loading.classList.remove('hidden');
  }
}

function setStat(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

async function loadStats(db, userId) {
  const uid = userId;

  try {
    const { data } = await db
      .from('study_groups')
      .select('course_code')
      .or(`creator_id.eq.${uid},members.cs.{${uid}}`);
    setStat('statCourses', new Set((data || []).map((r) => r.course_code)).size);
  } catch {
    setStat('statCourses', '--');
  }

  try {
    const { count } = await db
      .from('study_groups')
      .select('*', { count: 'exact', head: true })
      .or(`creator_id.eq.${uid},members.cs.{${uid}}`);
    setStat('statGroups', count ?? 'N/A');
  } catch {
    setStat('statGroups', 'N/A');
  }

  try {
    const { count } = await db
      .from('course_resources')
      .select('*', { count: 'exact', head: true });
    setStat('statResources', count ?? 'N/A');
  } catch {
    setStat('statResources', 'N/A');
  }
}

async function init() {
  const db = getDb() || initSupabase();
  if (!db) {
    showErrorState('لم يتم الاتصال بالخادم. يرجى تحديث الصفحة.');
    return;
  }

  if (!isLoggedIn()) {
    window.location.href = 'login.html';
    return;
  }

  const isValid = await verifySessionWithServer(db);
  if (!isValid) {
    window.location.href = 'login.html';
    return;
  }

  const user = getCurrentUser();
  if (!user || !user.id) {
    showErrorState('لم يتم العثور على بيانات المستخدم');
    return;
  }

  const el = document.getElementById('userFirstName');
  if (el) el.textContent = user.first_name || 'مستخدم';

  const emailEl = document.getElementById('userEmail');
  if (emailEl) emailEl.textContent = user.email || '';

  const initialEl = document.getElementById('userInitial');
  if (initialEl) initialEl.textContent = (user.first_name || 'م')[0].toUpperCase();

  const usernameEl = document.getElementById('userUsername');
  if (usernameEl) usernameEl.textContent = '@' + (user.username || '');

  const majorEl = document.getElementById('userMajor');
  if (majorEl) majorEl.textContent = user.major || '';

  if (user.is_admin) {
    const adminLink = document.getElementById('adminLink');
    if (adminLink) adminLink.classList.remove('hidden');
  }

  hideLoadingState();
  const content = document.getElementById('dashboardContent');
  if (content) content.classList.remove('hidden');

  loadStats(db, user.id).catch(() => {});
}

window.handleLogout = function(event) {
  if (event) event.preventDefault();
  logout();
};

let authTimeout = setTimeout(function() {
  const loading = document.getElementById('loadingState');
  if (loading && !loading.classList.contains('hidden')) {
    showErrorState('انتهت مهلة التحقق من الجلسة');
  }
}, 10000);

document.addEventListener('DOMContentLoaded', () => {
  init()
    .then(() => clearTimeout(authTimeout))
    .catch(() => {
      clearTimeout(authTimeout);
      showErrorState('فشل التحقق من الجلسة');
    });
});
