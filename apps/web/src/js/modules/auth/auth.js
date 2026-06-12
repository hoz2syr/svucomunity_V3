import { checkAuth } from './auth-guard.js';

export async function requireAuth(options = {}) {
  const result = await checkAuth(options);
  if (!result) {
    throw new Error('Unauthorized');
  }
  return result;
}
