export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone: string): boolean {
  return /^[+]?[\d\s()-]+$/.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

export function getPasswordStrength(password: string): number {
  if (password.length === 0) return 0;
  if (password.length <= 5) return password.length;
  return password.length - 4;
}
