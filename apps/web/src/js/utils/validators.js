export function isValidPassword(password) {
  if (typeof password !== 'string') return false;
  if (password.length < 8 || password.length > 128) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  if (!/[^A-Za-z0-9]/.test(password)) return false;
  return true;
}
