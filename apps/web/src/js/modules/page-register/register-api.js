import { escapeHtml, handleRegisterError, showToast } from '../core.js';
import { getCountryName } from '../shared.js';
import { i18nT, validateUsername, validateMajor, validatePhone, validatePassword, formatFieldError, getCurrentLang } from './validation.js';
import { state, resolveDb, MAJORS, fetchMajors } from './register-state.js';
import { setFormLoading } from './register-ui.js';

function buildPhone(raw) {
  const trimmed = (raw || '').trim();
  const digits = trimmed.replace(/\D/g, '');
  const dial = state.selected.dial;
  const localPfx = state.selected.localPfx || [];

  if (trimmed.startsWith('+') || trimmed.startsWith('00')) {
    return dial + digits.slice(dial.slice(1).length);
  }

  if (trimmed.startsWith('0') && localPfx.length > 0) {
    const prefixLen = localPfx[0].length;
    return dial + digits.slice(prefixLen);
  }

  return dial + digits;
}

function buildAuthPayload() {
  const rawPhone = document.getElementById('phone')?.value || '';
  return {
    username: document.getElementById('username')?.value.trim() || '',
    first_name: document.getElementById('firstName')?.value.trim() || '',
    middle_name: document.getElementById('middleName')?.value.trim() || '',
    last_name: document.getElementById('lastName')?.value.trim() || '',
    email: (document.getElementById('email')?.value || '').trim().toLowerCase(),
    major: state.selectedMajor || '',
    phone: buildPhone(rawPhone),
    country_code: state.selected.code,
    country_name: getCountryName(state.selected),
    country_dial: state.selected.dial,
    country_flag: state.selected.flag,
    created_at: new Date().toISOString(),
  };
}

async function submitRegisterForm() {
  if (state._submitting) return;
  state._submitting = true;

  if (!state.db) {
    state._submitting = false;
    showToast(handleRegisterError(new Error('تعذر الاتصال بالخادم')), 'error');
    return;
  }

  const username = document.getElementById('username')?.value.trim() || '';
  const password = document.getElementById('password')?.value || '';
  const confirm = document.getElementById('confirmPassword')?.value || '';
  const rawPhone = document.getElementById('phone')?.value || '';

  const usernameError = validateUsername(username);
  if (usernameError) {
    showToast(usernameError, 'error');
    return;
  }

  const majorError = validateMajor(state.selectedMajor);
  if (majorError) {
    showToast(majorError, 'error');
    const majorInput = document.getElementById('majorInput');
    if (majorInput) majorInput.classList.add('invalid');
    document.getElementById('majorError')?.classList.remove('hidden');
    return;
  }

  const phoneError = validatePhone(rawPhone, state.selected);
  if (phoneError) {
    showToast(phoneError, 'error');
    document.getElementById('phoneError')?.classList.remove('hidden');
    const phoneInput = document.getElementById('phone');
    if (phoneInput) phoneInput.classList.add('invalid');
    return;
  }

  const passwordError = validatePassword(password, confirm);
  if (passwordError) {
    showToast(passwordError, 'error');
    return;
  }

  const payload = buildAuthPayload();

  setFormLoading('registerBtn', true);

  try {
    const { data: duplicateCheck, error: duplicateError } = await state.db
      .from('users')
      .select('username,email')
      .eq('username', payload.username)
      .maybeSingle();

    if (duplicateError && duplicateError.code !== 'PGRST116') throw duplicateError;

    let usernameTaken = !!duplicateCheck;

    if (!usernameTaken) {
      const { data: emailCheck, error: emailErr } = await state.db
        .from('users')
        .select('username,email')
        .eq('email', payload.email)
        .maybeSingle();

      if (emailErr && emailErr.code !== 'PGRST116') throw emailErr;
      if (emailCheck) usernameTaken = true;
    }

    if (usernameTaken) {
      const language = getCurrentLang();
      const field = duplicateCheck?.username === payload.username ? 'username' : 'email';
      const error = new Error(formatFieldError(field, language));
      showToast(handleRegisterError(error), 'error');
      setFormLoading('registerBtn', false);
      return;
    }

    const { data, error } = await state.db.auth.signUp({
      email: payload.email,
      password,
      options: {
        data: {
          username: payload.username,
          first_name: payload.first_name,
          middle_name: payload.middle_name,
          last_name: payload.last_name,
          major: payload.major,
          phone: payload.phone,
          country_code: payload.country_code,
          country_name: payload.country_name,
          country_dial: payload.country_dial,
          country_flag: payload.country_flag,
        },
      },
    });

    if (error) throw error;

    showToast(i18nT('registerSuccess'), 'success');
    setTimeout(() => {
      const target = data.session ? 'login.html' : `verify-email.html?email=${encodeURIComponent(payload.email)}`;
      window.location.href = target;
    }, data.session ? 2500 : 3000);
  } catch (registrationError) {
    showToast(handleRegisterError(registrationError), 'error');
  } finally {
    state._submitting = false;
    setFormLoading('registerBtn', false);
  }
}

export {
  buildPhone,
  buildAuthPayload,
  submitRegisterForm,
};
