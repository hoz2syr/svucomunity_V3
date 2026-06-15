import { escapeHtml, safeStorageGet } from '../core.js';
import { COUNTRIES, getCountryName } from '../shared.js';
import { i18nT, localizeI18n, calcStrength } from './validation.js';
import { state, MAJORS, getCurrentLang } from './register-state.js';

const EYE_VISIBLE = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>';
const EYE_HIDDEN = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268 2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>';

function refreshThemeIcons() {
  const stored = safeStorageGet('svu_theme') || 'system';
  document.getElementById('themeToggleBtn')?.querySelectorAll('svg').forEach((icon) => {
    icon.classList.add('hidden');
  });
  const themeToIcon = {
    light: 'icon-sun',
    dark: 'icon-moon',
    system: 'icon-system',
  };
  const activeIcon = document.getElementById(themeToIcon[stored]);
  activeIcon?.classList.remove('hidden');
}

function renderList(query = '') {
  const list = document.getElementById('countryList');
  const none = document.getElementById('noResult');
  if (!list) return;

  const lang = getCurrentLang();
  const q = (query || '').trim().toLowerCase();
  const normalized = COUNTRIES.map((country) => {
    const name = typeof country.name === 'object' ? country.name[lang] || country.name.ar : country.name;
    return { ...country, displayName: name };
  });

  const filtered = normalized.filter((country) => {
    const haystack = [country.displayName, country.code, country.dial].join(' ').toLowerCase();
    return haystack.includes(q);
  });

  list.innerHTML = '';
  filtered.forEach((country) => {
    const li = document.createElement('li');
    li.className = 'c-row' + (country.code === state.selected.code ? ' active' : '');
    li.setAttribute('role', 'option');
    li.dataset.code = country.code;
    li.innerHTML = `<span class="cf">${escapeHtml(country.flag)}</span><span class="cn">${escapeHtml(country.displayName)}</span><span class="cd">${escapeHtml(country.dial)}</span><span class="ck">✓</span>`;
    li.addEventListener('click', () => {
      if (typeof window.chooseCountry === 'function') window.chooseCountry(country.code);
    });
    list.appendChild(li);
  });

  if (none) none.classList.toggle('hidden', filtered.length > 0);
}

function chooseCountry(code) {
  const country = COUNTRIES.find((entry) => entry.code === code);
  if (!country) return;
  state.selected = country;
  document.getElementById('selFlag').textContent = country.flag;
  document.getElementById('selDial').textContent = country.dial;
  updateHint();
  closeMenu();
  checkPhone(document.getElementById('phone').value);
}

function openMenu() {
  if (!document.getElementById('countryMenu')) return;
  state.dropOpen = true;
  document.getElementById('countryMenu').classList.add('open');
  const arrow = document.getElementById('dropArrow');
  if (arrow) arrow.style.transform = 'rotate(180deg)';
  const btn = document.getElementById('countryBtn');
  if (btn) btn.setAttribute('aria-expanded', 'true');
  setTimeout(() => document.getElementById('countrySearch')?.focus(), 60);
}

function closeMenu() {
  if (!document.getElementById('countryMenu')) return;
  state.dropOpen = false;
  document.getElementById('countryMenu').classList.remove('open');
  const arrow = document.getElementById('dropArrow');
  if (arrow) arrow.style.transform = '';
  const btn = document.getElementById('countryBtn');
  if (btn) btn.setAttribute('aria-expanded', 'false');
  const search = document.getElementById('countrySearch');
  if (search) search.value = '';
  renderList('');
}

function toggleMenu() {
  if (state.dropOpen) closeMenu();
  else openMenu();
}

function updateHint() {
  const country = state.selected;
  const px = country.localPfx.length ? country.localPfx[0] : '';
  const ex = px ? `0${px}xx xxx xxx` : `${country.dial} xxx xxx xxx`;
  const hint = document.getElementById('phoneHint');
  if (hint) hint.textContent = `${country.flag} ${i18nT('registerPhone')}: ${ex}`;
  const phone = document.getElementById('phone');
  if (phone) phone.placeholder = px ? `0${px}xx xxx xxx` : `${country.dial} xxx`;
}

function fmtPhone(raw) {
  const hasPlus = raw.charAt(0) === '+';
  const has00 = !hasPlus && raw.slice(0, 2) === '00';
  const digits = raw.replace(/\D/g, '');
  if (!digits) return hasPlus ? '+' : '';
  const n = digits.length;
  let formatted;
  if (n <= 3) formatted = digits;
  else if (n <= 6) formatted = `${digits.slice(0, 3)} ${digits.slice(3)}`;
  else if (n <= 9) formatted = `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  else formatted = `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9, 15)}`;
  return hasPlus ? '+' + formatted : has00 ? '00' + formatted : formatted;
}

function checkPhone(value) {
  const input = document.getElementById('phone');
  const icon = document.getElementById('phoneStatus');
  const error = document.getElementById('phoneError');
  const info = document.getElementById('phoneInfo');
  const digits = (value || '').replace(/\D/g, '');

  if (!digits) {
    input.classList.remove('valid', 'invalid');
    if (icon) icon.textContent = '';
    error?.classList.add('hidden');
    if (info) info.textContent = '';
    return false;
  }

  const valid = digits.length >= (state.selected.minLen ?? 0) && digits.length <= (state.selected.maxLen ?? 0);
  input.classList.toggle('valid', valid);
  input.classList.toggle('invalid', !valid);
  if (icon) icon.textContent = valid ? '✅' : '❌';
  error?.classList.toggle('hidden', valid);
  if (info) {
    const message = valid
      ? `${state.selected.flag} ${getCountryName(state.selected)} · ${digits.length}`
      : `${getCountryName(state.selected)}: ${state.selected.minLen}-${state.selected.maxLen} (${digits.length})`;
    info.textContent = message;
  }
  return valid;
}

function buildPhone(raw) {
  const trimmed = (raw || '').trim();
  const digits = trimmed.replace(/\D/g, '');
  const dialDigits = state.selected.dial.replace(/\D/g, '');

  if (trimmed.startsWith('+')) {
    const afterCountry = digits.slice(dialDigits.length);
    if (state.selected.localPfx?.length && afterCountry.startsWith(state.selected.localPfx[0])) {
      return state.selected.dial + afterCountry.slice(1);
    }
    return state.selected.dial + afterCountry;
  }

  if (trimmed.startsWith('00')) {
    return state.selected.dial + digits.slice(2 + dialDigits.length);
  }

  if (trimmed.startsWith('0') && state.selected.localPfx?.length) {
    return state.selected.dial + digits.slice(1);
  }

  return state.selected.dial + digits;
}

function renderMajors(query = '') {
  const list = document.getElementById('majorList');
  const menu = document.getElementById('majorMenu');
  if (!list) return;

  const q = (query || '').trim().toLowerCase();
  const filtered = query
    ? MAJORS.filter((major) => major.toLowerCase().includes(q)).slice(0, 15)
    : MAJORS.slice(0, 15);

  list.innerHTML = '';
  filtered.forEach((code) => {
    const li = document.createElement('li');
    li.className = 'm-row' + (state.selectedMajor === code ? ' active' : '');
    li.setAttribute('role', 'option');
    li.dataset.code = code;
    li.innerHTML = `<span class="mi">${escapeHtml(code)}</span><span class="check">✓</span>`;
    li.addEventListener('click', () => selectMajor(code));
    list.appendChild(li);
  });

  if (menu) menu.classList.toggle('open', state.majorMenuOpen);
}

function selectMajor(code) {
  if (!MAJORS.includes(code)) return;
  state.selectedMajor = code;
  const input = document.getElementById('majorInput');
  if (input) {
    input.value = code;
    input.classList.add('valid');
    input.classList.remove('invalid');
  }
  state.majorMenuOpen = false;
  document.getElementById('majorMenu')?.classList.remove('open');
  const arrow = document.getElementById('majorArrow');
  if (arrow) arrow.style.transform = '';
  document.getElementById('majorError')?.classList.add('hidden');
  renderMajors('');
}

function openMajorMenu() {
  state.majorMenuOpen = true;
  document.getElementById('majorMenu')?.classList.add('open');
  const arrow = document.getElementById('majorArrow');
  if (arrow) arrow.style.transform = 'rotate(180deg)';
  renderMajors(document.getElementById('majorInput').value);
  setTimeout(() => document.getElementById('majorInput')?.focus(), 60);
}

function closeMajorMenu() {
  state.majorMenuOpen = false;
  document.getElementById('majorMenu')?.classList.remove('open');
  const arrow = document.getElementById('majorArrow');
  if (arrow) arrow.style.transform = '';
}

function toggleMajorMenu() {
  if (state.majorMenuOpen) closeMajorMenu();
  else openMajorMenu();
}

function showStrength(password) {
  const strength = calcStrength(password);
  for (let index = 1; index <= 4; index += 1) {
    const bar = document.getElementById('s' + index);
    if (!bar) continue;
    bar.style.width = index <= strength ? '100%' : '0%';
    bar.style.background = index <= strength ? STR_COLOR[strength] : '';
  }

  const label = document.getElementById('strengthLabel');
  if (!label) return;

  const labelKey = STR_LABEL_KEY[strength];
  const isArabic = getCurrentLang().startsWith('ar');
  const fallbackMin = isArabic ? '8 أحرف على الأقل' : '8 characters minimum';
  const localized = i18nT(labelKey);

  if (strength > 0) {
    label.textContent = `${isArabic ? 'قوة كلمة المرور: ' : 'Strength: '}${localized || labelKey}`;
  } else {
    label.textContent = localizeI18n('passwordMinChars', fallbackMin);
  }
  label.style.color = strength > 0 ? STR_COLOR[strength] : '';
}

function makeToggle(inputId, buttonId) {
  document.getElementById(buttonId)?.addEventListener('click', function () {
    const input = document.getElementById(inputId);
    const svg = this.querySelector('svg');
    if (!input || !svg) return;
    if (input.type === 'password') {
      input.type = 'text';
      svg.innerHTML = EYE_VISIBLE;
    } else {
      input.type = 'password';
      svg.innerHTML = EYE_HIDDEN;
    }
  });
}

function setFormLoading(buttonId, loading) {
  const button = document.getElementById(buttonId);
  if (!button) return;
  button.disabled = loading;
  button.innerHTML = loading
    ? `<span class="flex items-center justify-center gap-2"><svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> ${localizeI18n('loading', 'Loading...')}</span>`
    : escapeHtml(i18nT('registerBtn') || 'إنشاء حساب');
}

function renderLoadingSkeleton() {
  return `<div class="glass rounded-2xl p-8 shadow-2xl">
  <div class="flex items-center justify-center gap-3 text-white">
    <svg class="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
    <span>${escapeHtml(i18nT('registerBtn') || 'جاري التحقق...')}</span>
  </div>
</div>`;
}

export {
  refreshThemeIcons,
  renderList,
  chooseCountry,
  openMenu,
  closeMenu,
  toggleMenu,
  updateHint,
  fmtPhone,
  checkPhone,
  buildPhone,
  renderMajors,
  selectMajor,
  openMajorMenu,
  closeMajorMenu,
  toggleMajorMenu,
  showStrength,
  makeToggle,
  setFormLoading,
  renderLoadingSkeleton,
};
