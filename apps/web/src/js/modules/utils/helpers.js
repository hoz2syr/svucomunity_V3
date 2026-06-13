/**
 * Simple hash router.
 *
 * Maps URL hash fragments to page sections. Designed for an MPA where
 * each page is a separate HTML file, but can also function as an SPA
 * router on index.html by showing/hiding sections.
 *
 * Supported routes:
 *   #home, #login, #register, #dashboard, #courses,
 *   #reset-password, #verify-email
 *
 * Behaviour:
 *   1. On index.html: shows/hides sections by ID (SPA mode).
 *   2. On other pages: if the hash matches the current page's purpose,
 *      the section is shown; otherwise the user is redirected to the
 *      appropriate HTML file for that route.
 *   3. Browser back/forward is handled natively via the hashchange event.
 *   4. Default route is #home.
 */

const ROUTE_SECTIONS = {
  'home': 'home-section',
  'login': 'login-section',
  'register': 'register-section',
  'dashboard': 'dashboard-section',
  'courses': 'courses-section',
  'reset-password': 'reset-password-section',
  'verify-email': 'verify-email-section',
};

const ROUTE_PAGES = {
  'home': 'index.html',
  'login': 'login.html',
  'register': 'register.html',
  'dashboard': 'dashboard.html',
  'courses': 'courses.html',
  'reset-password': 'reset-password.html',
  'verify-email': 'verify-email.html',
};

function getCurrentPage() {
  const path = window.location.pathname;
  return path.split('/').pop() || 'index.html';
}

function getRouteFromHash() {
  const hash = window.location.hash.replace(/^#/, '');
  return ROUTE_SECTIONS[hash] ? hash : 'home';
}

function showSection(route) {
  const sectionId = ROUTE_SECTIONS[route];
  if (!sectionId) return;

  document.querySelectorAll('[data-page-section]').forEach((el) => {
    el.classList.add('hidden');
  });

  const section = document.getElementById(sectionId);
  if (section) {
    section.classList.remove('hidden');
  }
}

function navigate(route) {
  const targetPage = ROUTE_PAGES[route];
  const currentPage = getCurrentPage();

  if (currentPage === targetPage) {
    showSection(route);
  } else {
    window.location.href = targetPage + '#' + route;
  }
}

export function initRouter() {
  window.addEventListener('hashchange', () => {
    const route = getRouteFromHash();
    navigate(route);
  });

  const initialRoute = getRouteFromHash();
  navigate(initialRoute);
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US');
}

export function debounce(fn, ms = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
