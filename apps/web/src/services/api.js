const API_BASE = import.meta.env.VITE_API_BASE_URL;
if (!API_BASE) {
  throw new Error('VITE_API_BASE_URL is required in production. Check your environment variables.');
}
const BASE = API_BASE;
const DEFAULT_TIMEOUT_MS = 10_000;
const MAX_RETRIES = 2;
const RETRYABLE_STATUSES = new Set([502, 503, 504]);

class ApiError extends Error {
  constructor(message, status, code, body) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.body = body;
  }
}

function isValidUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function buildUrl(path) {
  const url = new URL(path, BASE);
  if (!isValidUrl(url.toString())) {
    throw new Error('Bad API base URL');
  }
  return url.toString();
}

function baseHeaders() {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}

async function withTimeout(promise, ms) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  try {
    return await promise;
  } finally {
    clearTimeout(timeout);
  }
}

function safeUserMessage(body, fallback) {
  if (!body) return fallback;
  if (typeof body.message === 'string' && body.message.trim().length < 120) return body.message;
  if (typeof body.error === 'string' && body.error.trim().length < 120) return body.error;
  return fallback;
}

async function request(url, opts, attempt) {
  const { signal, ...fetchOpts } = opts;
  const response = await withTimeout(fetch(url, { ...fetchOpts, signal }), opts.timeout || DEFAULT_TIMEOUT_MS);

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (!response.ok) {
    let parsedBody = null;
    if (isJson) {
      try { parsedBody = await response.json(); } catch { /* leave null */ }
    } else {
      try { parsedBody = { message: await response.text() }; } catch { /* leave null */ }
    }

    const shouldRetry = attempt < MAX_RETRIES && RETRYABLE_STATUSES.has(response.status);
    if (shouldRetry) {
      await new Promise((resolve) => setTimeout(resolve, 300 * attempt));
      return request(url, opts, attempt + 1);
    }

    const message = safeUserMessage(parsedBody, 'HTTP error');
    throw new ApiError(message, response.status, parsedBody?.code ?? response.statusText, parsedBody);
  }

  return isJson ? response.json() : response.text();
}

export async function api(path, opts = {}) {
  const url = buildUrl(path);

  const fetchOpts = {
    ...opts,
    headers: { ...baseHeaders(), ...(opts.headers ?? {}) },
  };

  if (fetchOpts.signal && fetchOpts.signal === opts.signal) {
    /* pass through */
  }

  return request(url, fetchOpts, 0);
}

export { ApiError };
