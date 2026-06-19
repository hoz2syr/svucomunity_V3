const PASSWORD_MIN = 8;
const PASSWORD_MAX = 128;

const STR_COLOR = ['', '#ef4444', '#f97316', '#eab308', '#22c55e'];
const STR_LABEL_KEY = ['', 'passwordVeryWeak', 'passwordWeak', 'passwordMedium', 'passwordStrong'];

function tI18n(key) {
  return document.documentElement.getAttribute('data-i18n-' + key) || key;
}

const i18nT = tI18n;

function validateUsername(value) {
  const username = (value || '').trim();
  if (!/^[a-zA-Z]+_\d{6}$/.test(username)) {
    return i18nT('registerUsernameFormat');
  }
  return null;
}

function validateMajor(value) {
  const major = (value || '').trim();
  if (!major) return i18nT('registerMajorRequired');
  return null;
}

function validatePhone(value, country) {
  const digits = (value || '').replace(/\D/g, '');
  if (!digits) {
    return i18nT('registerPhoneRequired');
  }
  if (!country) {
    return i18nT('registerPhoneInvalid');
  }
  let normalized = digits;
  if ((value || '').startsWith('+') || (value || '').startsWith('00')) {
    normalized = digits.slice((country.dial || '').replace(/\D/g, '').length);
  } else if (digits.startsWith('0') && (country?.localPfx ?? []).length) {
    normalized = digits.slice(1);
  }
  if ((country?.localPfx ?? []).length && normalized.startsWith('0')) {
    return i18nT('registerPhoneInvalid');
  }
  if (normalized.length < (country?.minLen ?? 0)) {
    return i18nT('registerPhoneInvalid');
  }
  if (normalized.length > country.maxLen) {
    return i18nT('registerPhoneInvalid');
  }
  return null;
}

function validatePassword(password, confirm) {
  const pwd = password || '';
  if (pwd.length < 8) {
    return i18nT('registerPasswordTooShort');
  }
  if (!/[A-Z]/.test(pwd)) {
    return i18nT('registerPasswordMissingUppercase');
  }
  if (!/[a-z]/.test(pwd)) {
    return i18nT('registerPasswordMissingLowercase');
  }
  if (!/[0-9]/.test(pwd)) {
    return i18nT('registerPasswordMissingNumber');
  }
  if (!/[^A-Za-z0-9]/.test(pwd)) {
    return i18nT('registerPasswordMissingSymbol');
  }
  if ((confirm || '').length < 8) {
    return i18nT('registerPasswordTooShort');
  }
  if (pwd !== (confirm || '')) {
    return i18nT('registerPasswordMismatch');
  }
  return null;
}

function formatFieldError(field) {
  return i18nT(field === 'username' ? 'registerDuplicateUsername' : 'registerDuplicateEmail');
}

function calcStrength(password) {
  const value = password || '';
  let score = 0;
  if (value.length >= PASSWORD_MIN) score++;
  if (/[A-Z]/.test(value)) score++;
  if (/[0-9]/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;
  return score;
}

function localizeI18n(key, fallback) {
  const fromAttr = document.documentElement.getAttribute('data-i18n-' + key);
  if (fromAttr) return fromAttr;
  const fromWindow = window.i18n?.t?.(key);
  if (fromWindow) return fromWindow;
  return fallback || key;
}

export {
  PASSWORD_MIN,
  PASSWORD_MAX,
  STR_COLOR,
  STR_LABEL_KEY,
  tI18n,
  i18nT,
  validateUsername,
  validateMajor,
  validatePhone,
  validatePassword,
  formatFieldError,
  calcStrength,
  localizeI18n,
};
