/**
 * Dashboard Page Logic
 */
import { initializeTheme, isLoggedIn, getCurrentUser, getDb, verifySessionWithServer } from '../core.js';
import { initSupabase } from '../config.js';
import { showToast, logout } from '../shared.js';
import { initLang } from '../i18n.js';

function hideLoadingState() {
  const el = document.getElementById('loadingState');
  if (el) el.classList.add('hidden');
}

function showErrorState(message) {
  hideLoadingState();
  const loading = document.getElementById('loadingState');
  if (loading) {
    loading.innerHTML = '<div class="text-center">'
      + '<div class="text-5xl mb-4">⚠️</div>'
      + '<p class="text-red-400 mb-2">' + (message || 'حدث خطأ') + '</p>'
      + '<a href="login.html" class="text-primary-400 underline">تسجيل الدخول</a>'
      + '</div>';
    loading.classList.remove('hidden');
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
