/**
 * SVU Community — Minimal hash-based SPA router
 *
 * Routes are registered as { path: handler } pairs.
 * The active route is reflected in `window.location.hash` (e.g. `#/courses`).
 * Falls back to `#/dashboard` if no hash is present.
 */

const DEFAULT_ROUTE = '/dashboard';
const routes = new Map();
let _navigating = false;

export function registerRoute(path, handler) {
  routes.set(path, handler);
}

export function navigate(path) {
  const normalized = normalizePath(path);
  window.location.hash = '#' + normalized;
}

export function getCurrentPath() {
  var hash = window.location.hash || '';
  return normalizePath(hash.replace(/^#/, '')) || DEFAULT_ROUTE;
}

function normalizePath(path) {
  if (!path.startsWith('/')) path = '/' + path;
  return path.replace(/\/+/g, '/');
}

export function resolveRoute(path) {
  if (!path || typeof path !== 'string') return routes.get(DEFAULT_ROUTE);

  const decoded = decodeURIComponent(path).replace(/[\x00-\x20]/g, '');

  if (routes.has(decoded)) return routes.get(decoded);

  for (const [prefix, handler] of routes.entries()) {
    if (!prefix || prefix === '/') continue;
    if (decoded === prefix || decoded.startsWith(prefix + '/')) {
      return handler;
    }
  }

  return routes.get('/404') || routes.get(DEFAULT_ROUTE);
}

export function startRouter() {
  function handleRoute() {
    var path = getCurrentPath();
    var handler = resolveRoute(path);
    if (typeof handler === 'function') {
      try {
        handler(path);
      } catch (err) {
        console.error('[router] handler error for path', path, err);
      }
    }
    document.querySelectorAll('[data-page]').forEach(function (el) {
      el.classList.toggle('active', el.getAttribute('data-page') === path.slice(1));
    });
  }

  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}

export function isNavigating() {
  return _navigating;
}
