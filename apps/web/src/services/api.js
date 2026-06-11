const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function isValidUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

async function withTimeout(promise, ms = 10000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  try {
    const result = await promise;
    return result;
  } finally {
    clearTimeout(timeout);
  }
}

export async function api(path, opts = {}) {
  const timeoutMs = opts.timeout ?? 10000;
  if (!isValidUrl(BASE)) {
    throw new Error('Bad API base URL');
  }

  const url = new URL(path, BASE).toString();

  let res;
  try {
    res = await withTimeout(fetch(url, {
      headers: { 'Content-Type': 'application/json', ...opts.headers },
      ...opts,
      signal: opts.signal,
    }), timeoutMs);
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw err;
  }

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (!res.ok) {
    let message = 'HTTP error';
    try {
      const body = isJson ? await res.json() : await res.text();
      message = body?.message || body?.error || message;
    } catch {
      // leave default message
    }
    throw new Error(message);
  }

  if (isJson) {
    return res.json();
  }

  return res.text();
}
