/**
 * SVU Community — Minimal hash-based SPA router
 *
 * Routes are registered as { path: handler } pairs.
 * The active route is reflected in `window.location.hash` (e.g. `#/courses`).
 * Falls back to `#/dashboard` if no hash is present.
 */

const DEFAULT_ROUTE = '/dashboard';
const routes = new Map();

export function registerRoute(path, handler) {
  routes.set(path, handler);
}

export function navigate(path) {
  window.location.hash = '#' + path;
}

export function getCurrentPath() {
  var hash = window.location.hash || '';
  return hash.replace(/^#/, '') || DEFAULT_ROUTE;
}

export function resolveRoute(path) {
  // Exact match
  if (routes.has(path)) return routes.get(path);

  // Prefix match (e.g. /courses/123)
  for (const [prefix, handler] of routes.entries()) {
    if (prefix !== '/' && path.startsWith(prefix)) return handler;
    if (prefix === path) return handler;
  }

  // 404 fallback
  var fallback = routes.get('/404') || routes.get(DEFAULT_ROUTE);
  return fallback;
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
