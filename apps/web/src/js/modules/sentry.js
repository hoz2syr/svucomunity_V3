/**
 * SVU Community — Sentry integration shim
 *
 * Loads the Sentry browser SDK from CDN if an env var is present,
 * then wraps `window.Sentry` in a safe API so other modules can
 * call `captureException` without crashing when Sentry is unconfigured.
 */

let sentryReady = false;
let sentryApi = {
  init: function () {},
  captureException: function () {},
  captureMessage: function () {},
};

export function initSentry() {
  if (sentryReady) return sentryApi;
  if (typeof window.SVU_ENV === 'undefined' || !window.SVU_ENV.SENTRY_DSN) {
    console.info('[sentry] SENTRY_DSN not configured — Sentry disabled.');
    return sentryApi;
  }

  try {
    if (typeof window.Sentry === 'undefined') {
      var script = document.createElement('script');
      script.src =
        'https://js.sentry.io/' + window.SVU_ENV.SENTRY_DSN + '.min.js';
      script.crossOrigin = 'anonymous';
      script.async = true;
      script.onerror = function () {
        console.warn('[sentry] CDN load failed');
      };
      document.head.appendChild(script);
    }
    if (typeof window.Sentry !== 'undefined') {
      window.Sentry.init({
        dsn: window.SVU_ENV.SENTRY_DSN,
        environment: window.SVU_ENV.NODE_ENV || 'production',
        tracesSampleRate: 0.05,
        replaysSessionSampleRate: 0.01,
        replaysOnErrorSampleRate: 0.1,
      });
      sentryApi = {
        init: function () {},
        captureException: function (error, context) {
          try {
            window.Sentry.captureException(error, { extra: context || {} });
          } catch (_) {}
        },
        captureMessage: function (msg, level) {
          try {
            window.Sentry.captureMessage(msg, { level: level || 'info' });
          } catch (_) {}
        },
      };
      sentryReady = true;
    }
  } catch (e) {
    console.warn('[sentry] init failed:', e);
  }
  return sentryApi;
}

export const Sentry = sentryApi;
