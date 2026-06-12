import { state, MAJORS, fetchMajors, resolveDb } from './register-state.js';
import { initLang, applyLanguage } from '../i18n.js';
import {
  renderList,
  chooseCountry,
  openMenu,
  closeMenu,
  toggleMenu,
  updateHint,
  fmtPhone,
  checkPhone,
  renderMajors,
  selectMajor,
  openMajorMenu,
  closeMajorMenu,
  toggleMajorMenu,
  refreshThemeIcons,
  makeToggle,
  showStrength,
} from './register-ui.js';

export async function initRegisterPage() {
  resolveDb();
  await initLang();
  applyLanguage();

  renderList('');
  updateHint();

  document.getElementById('countryBtn')?.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleMenu();
  });

  document.addEventListener('click', (event) => {
    if (state.dropOpen && !document.getElementById('countryWrapper')?.contains(event.target)) {
      closeMenu();
    }
  });

  const countrySearch = document.getElementById('countrySearch');
  countrySearch?.addEventListener('input', (event) => {
    event.stopPropagation();
    renderList(event.target.value);
  });
  countrySearch?.addEventListener('click', (event) => event.stopPropagation());
  countrySearch?.addEventListener('keydown', (event) => {
    event.stopPropagation();
    if (event.key === 'Escape') closeMenu();
  });

  const majorInput = document.getElementById('majorInput');
  majorInput?.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleMajorMenu();
  });
  majorInput?.addEventListener('input', (event) => {
    event.stopPropagation();
    state.selectedMajor = null;
    event.target.classList.remove('valid');
    renderMajors(event.target.value);
    state.majorMenuOpen = true;
  });
  majorInput?.addEventListener('keydown', (event) => {
    event.stopPropagation();
    if (event.key === 'Escape') closeMajorMenu();
    else if (event.key === 'Enter') {
      event.preventDefault();
      document.querySelector('#majorList .m-row')?.click();
    }
  });

  document.addEventListener('click', (event) => {
    if (state.majorMenuOpen && !document.getElementById('majorWrapper')?.contains(event.target)) {
      closeMajorMenu();
    }
  });

  const fetchedMajors = await fetchMajors();
  const majors = fetchedMajors;
  renderMajors('');
  if (!state.selectedMajor && majors.length) {
    state.selectedMajor = majors[0];
  }

  const phoneInput = document.getElementById('phone');
  phoneInput?.addEventListener('input', function () {
    const caret = this.selectionStart;
    const previousLength = this.value.length;
    const formatted = fmtPhone(this.value);
    this.value = formatted;
    try {
      this.setSelectionRange(caret + (formatted.length - previousLength), caret + (formatted.length - previousLength));
    } catch {
      // ignore selection restore errors
    }
    checkPhone(this.value);
  });
  phoneInput?.addEventListener('paste', () => {
    setTimeout(() => {
      phoneInput.value = fmtPhone(phoneInput.value);
      checkPhone(phoneInput.value);
    }, 0);
  });
  phoneInput?.addEventListener('blur', () => checkPhone(phoneInput.value));

  makeToggle('password', 'togglePwd');
  makeToggle('confirmPassword', 'toggleConfirm');

  document.getElementById('password')?.addEventListener('input', function () {
    showStrength(this.value);
    const confirm = document.getElementById('confirmPassword');
    if (confirm?.value) document.getElementById('matchMsg')?.classList.toggle('hidden', confirm.value === this.value);
  });

  document.getElementById('confirmPassword')?.addEventListener('input', function () {
    const password = document.getElementById('password')?.value || '';
    document.getElementById('matchMsg')?.classList.toggle('hidden', !this.value || this.value === password);
  });

  refreshThemeIcons();
}

window.chooseCountry = chooseCountry;
