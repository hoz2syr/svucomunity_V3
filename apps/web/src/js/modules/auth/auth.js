import { checkAuth } from './auth-guard.js';

export async function requireAuth(options = {}) {
  const result = await checkAuth(options);
  if (!result) {
    throw new Error('Unauthorized');
  }
  return result;
}

export async function requireAuthSafe(options = {}) {
  try {
    return await requireAuth(options);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unauthorized';
    const error = new Error(message);
    error.cause = err instanceof Error ? err.cause ?? err : undefined;
    throw error;
  }
}
