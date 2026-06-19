export function openModal(id) {
  const el = document.getElementById(id);
  if (!el) return;

  el.classList.add('open');
  el.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  const previousFocus = document.activeElement;

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeModal(id);
      previousFocus?.focus();
      return;
    }
    if (e.key === 'Tab') {
      const focusable = el.querySelectorAll(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  };

  el._handleKeyDown = handleKeyDown;
  document.addEventListener('keydown', handleKeyDown);

  const handleClick = (e) => {
    if (e.target === el) {
      closeModal(id);
      previousFocus?.focus();
    }
  };

  el._handleClick = handleClick;
  el.addEventListener('click', handleClick);

  const firstFocusable = el.querySelector(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  firstFocusable?.focus();
}

export function closeModal(id) {
  const el = document.getElementById(id);
  if (!el) return;

  el.classList.remove('open');
  el.setAttribute('aria-hidden', 'true');

  if (el._handleKeyDown) {
    document.removeEventListener('keydown', el._handleKeyDown);
    delete el._handleKeyDown;
  }
  if (el._handleClick) {
    el.removeEventListener('click', el._handleClick);
    delete el._handleClick;
  }

  document.body.style.overflow = '';
}

export function initModals() {
  document.querySelectorAll('[data-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.modal;
      if (id) openModal(id);
    });
  });
}
