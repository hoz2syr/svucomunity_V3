export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

interface ValidationResult {
  isValid: boolean;
  error: string;
}

export function validateEmail(val: string): ValidationResult {
  if (!val) return { isValid: false, error: 'البريد الإلكتروني مطلوب' };
  if (!emailRegex.test(val)) return { isValid: false, error: 'صيغة البريد الإلكتروني غير صحيحة' };
  return { isValid: true, error: '' };
}

export function validatePassword(val: string): ValidationResult {
  if (!val) return { isValid: false, error: 'كلمة المرور مطلوبة' };
  if (val.length < 8) return { isValid: false, error: 'كلمة المرور يجب أن تتكون من 8 أحرف على الأقل' };
  if (!passwordRegex.test(val)) return { isValid: false, error: 'تحتاج إلى حرف كبير وحرف صغير ورقم ورمز خاص' };
  return { isValid: true, error: '' };
}

export function validateName(val: string): ValidationResult {
  if (!val.trim()) return { isValid: false, error: 'الاسم الكامل مطلوب' };
  return { isValid: true, error: '' };
}
