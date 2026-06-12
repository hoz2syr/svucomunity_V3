/**
 * ════════════════════════════════════════════════════════════════
 * SVU Community — Feedback & Rating System v1
 * 📝 تقييم إلزامي بعد الجولة — لغة فصحى ودية
 * ════════════════════════════════════════════════════════════════
 */

import { safeStorageGet, safeStorageSet, safeStorageRemove, escapeHtml } from './core.js';

// ── Constants ────────────────────────────────────────────────────

const KEY = 'svu_feedback_done';
const STYLE_ID = 'svu-feedback-css';
const MODAL_ID = 'svu-feedback-modal';

const RATING_LABELS = [
  '',
  'fbRate1', 'fbRate2', 'fbRate3', 'fbRate4', 'fbRate5',
];

// ── Internal state ───────────────────────────────────────────────

let rating = 0;
let submitted = false;

// ── Helpers ──────────────────────────────────────────────────────

function t(k) {
  return window.i18n?.t?.(k) || k;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── CSS ──────────────────────────────────────────────────────────

function injectCSS() {
  if (document.getElementById(STYLE_ID)) return;

  const s = document.createElement('style');
  s.id = STYLE_ID;
  s.textContent = `
    .fb-overlay{
      position:fixed;inset:0;z-index:99999;
      background:rgba(0,0,0,0);backdrop-filter:blur(0px);
      display:flex;align-items:center;justify-content:center;
      padding:16px;transition:all .4s ease;
    }
    .fb-overlay.fb-show{background:rgba(0,0,0,.65);backdrop-filter:blur(8px)}

    .fb-modal{
      width:100%;max-width:420px;
      background:linear-gradient(160deg,rgba(15,23,42,.98),rgba(30,41,59,.96));
      backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);
      border:1px solid rgba(255,255,255,.1);border-radius:24px;
      padding:32px 28px;position:relative;overflow:hidden;
      box-shadow:0 30px 80px rgba(0,0,0,.6);
      transform:scale(.92) translateY(20px);opacity:0;
      transition:all .4s cubic-bezier(0.34,1.56,0.64,1);
    }
    .fb-overlay.fb-show .fb-modal{transform:scale(1) translateY(0);opacity:1}

    .fb-modal::before{
      content:"";position:absolute;top:-60%;left:-60%;
      width:220%;height:220%;
      background:radial-gradient(circle at 30% 30%,rgba(56,189,248,.08),transparent 60%),
        radial-gradient(circle at 70% 70%,rgba(129,140,248,.06),transparent 60%);
      pointer-events:none;
    }

    .fb-emoji{font-size:48px;text-align:center;margin-bottom:12px;animation:fb-bounce 2s ease infinite}
    @keyframes fb-bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}

    .fb-title{text-align:center;font-size:20px;font-weight:700;color:#fff;margin-bottom:6px;line-height:1.4}
    .fb-sub{text-align:center;font-size:13px;color:rgba(255,255,255,.5);margin-bottom:24px;line-height:1.6}

    .fb-stars{display:flex;justify-content:center;gap:8px;margin-bottom:8px;direction:ltr}
    .fb-star{font-size:36px;cursor:pointer;transition:all .2s ease;filter:grayscale(1) brightness(.5);user-select:none;-webkit-user-select:none}
    .fb-star:hover,.fb-star.fb-active{filter:none;transform:scale(1.15)}
    .fb-star:active{transform:scale(.95)}

    .fb-rating-label{text-align:center;font-size:13px;font-weight:600;color:rgba(255,255,255,.4);margin-bottom:20px;min-height:20px;transition:color .2s}

    .fb-textarea{
      width:100%;min-height:90px;resize:vertical;
      background:rgba(15,23,42,.6);border:1px solid rgba(148,163,184,.15);
      border-radius:14px;padding:14px 16px;
      color:#fff;font-size:14px;font-family:inherit;line-height:1.6;
      transition:all .2s;box-sizing:border-box;
    }
    .fb-textarea:focus{outline:none;border-color:rgba(56,189,248,.5);box-shadow:0 0 0 3px rgba(56,189,248,.1)}
    .fb-textarea::placeholder{color:rgba(255,255,255,.25)}

    .fb-label{display:block;font-size:13px;font-weight:600;color:rgba(255,255,255,.6);margin-bottom:8px}

    .fb-submit{
      width:100%;padding:14px;margin-top:16px;
      background:linear-gradient(135deg,#38bdf8,#0ea5e9);
      color:#fff;font-size:15px;font-weight:600;
      border:none;border-radius:14px;cursor:pointer;
      transition:all .2s;font-family:inherit;
      box-shadow:0 4px 20px rgba(56,189,248,.3);
    }
    .fb-submit:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(56,189,248,.4)}
    .fb-submit:active{transform:translateY(0)}
    .fb-submit:disabled{opacity:.4;cursor:not-allowed;transform:none;box-shadow:none}

    .fb-skip{display:block;text-align:center;margin-top:12px;background:none;border:none;color:rgba(255,255,255,.2);font-size:12px;cursor:pointer;font-family:inherit;padding:4px 8px;transition:color .2s}
    .fb-skip:hover{color:rgba(255,255,255,.45)}

    .fb-success{text-align:center;padding:20px 0}
    .fb-success-emoji{font-size:56px;margin-bottom:12px;animation:fb-success-pop .5s cubic-bezier(0.34,1.56,0.64,1)}
    @keyframes fb-success-pop{from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1}}

    .fb-success-title{font-size:20px;font-weight:700;color:#fff;margin-bottom:8px}
    .fb-success-text{font-size:14px;color:rgba(255,255,255,.5);line-height:1.7}

    @media(max-width:639px){
      .fb-modal{padding:24px 20px;border-radius:20px}
      .fb-star{font-size:30px}
      .fb-title{font-size:18px}
      .fb-emoji{font-size:40px}
    }
  `;
  document.head.appendChild(s);
}

// ── Modal ────────────────────────────────────────────────────────

function buildModal() {
  const overlay = document.createElement('div');
  overlay.id = MODAL_ID;
  overlay.className = 'fb-overlay';

  overlay.innerHTML = `
    <div class="fb-modal">
      <div id="fbForm">
        <div class="fb-emoji">💬</div>
        <h2 class="fb-title">${t('fbTitle')}</h2>
        <p class="fb-sub">${t('fbSubtitle')}</p>

        <div class="fb-stars" id="fbStars">
          ${[1,2,3,4,5].map(n => `<span class="fb-star" data-v="${n}">⭐</span>`).join('')}
        </div>
        <div class="fb-rating-label" id="fbRatingLabel">${t('fbPickRating')}</div>

        <label class="fb-label">${t('fbFeedbackLabel')}</label>
        <textarea class="fb-textarea" id="fbText" placeholder="${t('fbPlaceholder')}"></textarea>

        <button class="fb-submit" id="fbSubmit" disabled>${t('fbSubmit')}</button>
        <button class="fb-skip" id="fbSkip">${t('fbSkip')}</button>
      </div>

      <div id="fbSuccess" class="fb-success" style="display:none">
        <div class="fb-success-emoji">🎉</div>
        <h2 class="fb-success-title">${t('fbSuccessTitle')}</h2>
        <p class="fb-success-text">${t('fbSuccessText')}</p>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  bindEvents(overlay);
  return overlay;
}

// ── Events ───────────────────────────────────────────────────────

function bindEvents(overlay) {
  const stars = overlay.querySelectorAll('.fb-star');
  const submitBtn = overlay.querySelector('#fbSubmit');
  const skipBtn = overlay.querySelector('#fbSkip');
  const textarea = overlay.querySelector('#fbText');
  const ratingLabel = overlay.querySelector('#fbRatingLabel');

  stars.forEach(star => {
    star.addEventListener('mouseenter', () => {
      const val = parseInt(star.dataset.v, 10);
      highlightStars(stars, val);
      ratingLabel.textContent = t(RATING_LABELS[val]) || '';
      ratingLabel.style.color = '#38bdf8';
    });

    star.addEventListener('mouseleave', () => {
      highlightStars(stars, rating);
      ratingLabel.textContent = rating > 0 ? t(RATING_LABELS[rating]) : t('fbPickRating');
      ratingLabel.style.color = rating > 0 ? '#38bdf8' : 'rgba(255,255,255,.4)';
    });

    star.addEventListener('click', () => {
      rating = parseInt(star.dataset.v, 10);
      highlightStars(stars, rating);
      ratingLabel.textContent = t(RATING_LABELS[rating]);
      ratingLabel.style.color = '#38bdf8';
      submitBtn.disabled = false;

      star.style.transform = 'scale(1.4)';
      setTimeout(() => { star.style.transform = ''; }, 200);
    });
  });

  submitBtn.addEventListener('click', () => {
    if (rating === 0) return;
    submitFeedback(overlay);
  });

  skipBtn.addEventListener('click', () => {
    safeStorageSet(KEY, 'true');
    hideModal(overlay);
  });

  overlay.addEventListener('click', e => {
    if (e.target === overlay) {
      const modal = overlay.querySelector('.fb-modal');
      modal.style.animation = 'fb-shake .4s ease';
      setTimeout(() => { modal.style.animation = ''; }, 400);
    }
  });

  if (!document.getElementById('fb-shake-css')) {
    const shake = document.createElement('style');
    shake.id = 'fb-shake-css';
    shake.textContent = '@keyframes fb-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}';
    document.head.appendChild(shake);
  }
}

function highlightStars(stars, val) {
  stars.forEach(s => {
    const v = parseInt(s.dataset.v, 10);
    s.classList.toggle('fb-active', v <= val);
  });
}

// ── Submit ───────────────────────────────────────────────────────

function submitFeedback(overlay) {
  if (submitted) return;
  submitted = true;

  const feedbackText = escapeHtml(overlay.querySelector('#fbText').value.trim());
  const feedbackData = {
    rating,
    feedback: feedbackText,
    timestamp: new Date().toISOString(),
    page: window.location.pathname,
  };

  safeStorageSet('svu_feedback_data', JSON.stringify(feedbackData));
  safeStorageSet(KEY, 'true');

  saveToSupabase(feedbackData);
  showSuccess(overlay);
}

function saveToSupabase(data) {
  try {
    const db = window.getDb?.();
    if (!db) return;

    const currentUser = safeStorageGet('svu_user_data');
    const userId = currentUser ? JSON.parse(currentUser).id : null;

    db.from('feedback')
      .insert([{
        rating: data.rating,
        feedback: data.feedback,
        user_id: userId,
        created_at: data.timestamp,
      }])
      .then(result => {
        if (result.error) {
          console.warn('[feedback] Could not save to Supabase', result.error);
        }
      });
  } catch (e) {
    console.debug('[feedback] Saved to localStorage only');
  }
}

function showSuccess(overlay) {
  const form = overlay.querySelector('#fbForm');
  const success = overlay.querySelector('#fbSuccess');

  form.style.opacity = '0';
  form.style.transform = 'translateY(-10px)';
  setTimeout(() => {
    form.style.display = 'none';
    success.style.display = 'block';
  }, 200);

  setTimeout(() => hideModal(overlay), 3500);
}

// ── Public API ───────────────────────────────────────────────────

export function showModal() {
  if (safeStorageGet(KEY) === 'true') return;
  injectCSS();
  const overlay = document.getElementById(MODAL_ID) || buildModal();

  rating = 0;
  submitted = false;

  const form = overlay.querySelector('#fbForm');
  const success = overlay.querySelector('#fbSuccess');
  form.style.display = '';
  form.style.opacity = '1';
  form.style.transform = '';
  success.style.display = 'none';
  overlay.querySelector('#fbText').value = '';
  overlay.querySelector('#fbSubmit').disabled = true;
  overlay.querySelector('#fbRatingLabel').textContent = t('fbPickRating');

  const stars = overlay.querySelectorAll('.fb-star');
  highlightStars(stars, 0);

  overlay.style.display = 'flex';
  requestAnimationFrame(() => overlay.classList.add('fb-show'));
}

export function hideModal(overlay) {
  if (!overlay) overlay = document.getElementById(MODAL_ID);
  if (!overlay) return;
  overlay.classList.remove('fb-show');
  setTimeout(() => { overlay.style.display = 'none'; }, 400);
}

export function isDone() {
  return safeStorageGet(KEY) === 'true';
}

export function resetFeedback() {
  safeStorageRemove(KEY);
  safeStorageRemove('svu_feedback_data');
  submitted = false;
  rating = 0;
}

// Backward-compatible window assignments
window.svuFeedback = { show: showModal, hide: hideModal, isDone, reset: resetFeedback };
