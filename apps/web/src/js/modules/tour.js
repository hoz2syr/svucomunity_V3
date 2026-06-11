/**
 * ════════════════════════════════════════════════════════════════
 * SVU Community — Dashboard Onboarding Tour v8 (Fixed)
 *
 * الإصلاحات:
 *   1. spotlight: ينتظر انتهاء scroll فعلاً بدلاً من setTimeout ثابت
 *   2. transform: يُعاد ضبطه كاملاً قبل كل positioning لمنع التراكم
 *   3. MutationObserver: مُقيَّد لمنع الحلقة اللانهائية
 *   4. slide: يُلغي الـ timeouts القديمة لمنع تراكمها عند الضغط السريع
 * ════════════════════════════════════════════════════════════════
 */

import { safeStorageGet, safeStorageSet, safeStorageRemove } from './core.js';
import { t as i18nT } from './i18n.js';

// ════════════════════════════════════════════════════════════════
// Constants
// ════════════════════════════════════════════════════════════════

const STORAGE_KEY = 'svu_tour_v8_done';

const STEPS = [
  { target: null, titleKey: 'tour_welcome_title', descKey: 'tour_welcome_desc', centered: true },
  { target: '[data-tour="user-card"]', titleKey: 'tour_usercard_title', descKey: 'tour_usercard_desc' },
  { target: '[data-tour="groups-card"]', titleKey: 'tour_groups_title', descKey: 'tour_groups_desc' },
  { target: '[data-tour="materials-card"]', titleKey: 'tour_materials_title', descKey: 'tour_materials_desc' },
  { target: '[data-tour="schedule-card"]', titleKey: 'tour_schedule_title', descKey: 'tour_schedule_desc' },
  { target: '[data-tour="profile-card"]', titleKey: 'tour_profile_title', descKey: 'tour_profile_desc' },
  { target: '[data-tour="forum-card"]', titleKey: 'tour_forum_title', descKey: 'tour_forum_desc' },
];

// ════════════════════════════════════════════════════════════════
// Helpers
// ════════════════════════════════════════════════════════════════

function tr(key) {
  return i18nT(key);
}

function isDone() {
  try {
    return safeStorageGet(STORAGE_KEY) === '1';
  } catch (e) {
    return false;
  }
}

function markDone() {
  try { safeStorageSet(STORAGE_KEY, '1'); } catch (e) {}
}

function _el(tag, cls) {
  const e = document.createElement(tag);
  e.className = cls;
  return e;
}

// ════════════════════════════════════════════════════════════════
// Tour Class
// ════════════════════════════════════════════════════════════════

class Tour {
  constructor() {
    this.active = false;
    this.step = 0;
    this.els = {};
    this._resizeRaf = null;
    this._scrollRaf = null;
    this._resizeObs = null;
    this._slideTimer1 = null;
    this._slideTimer2 = null;
    this._repositioning = false;
  }

  init() {
    if (isDone()) return;
    const pid = (location.pathname.split('/').pop() || 'dashboard.html').replace('.html', '');
    if (pid !== 'dashboard') return;

    setTimeout(() => this.start(), 1200);
  }

  start() {
    if (this.active) return;
    this.active = true;
    this.step = 0;
    this._build();
    this._show(this.step);
  }

  // ── DOM Construction ────────────────────────────────────────

  _build() {
    const b = document.body;

    this.els.overlay = _el('div', 'tour8-overlay');
    b.appendChild(this.els.overlay);

    this.els.spot = _el('div', 'tour8-spot');
    b.appendChild(this.els.spot);

    this.els.pop = _el('div', 'tour8-pop');
    this.els.pop.innerHTML = `
      <div class="tour8-pop-inner">
        <div class="tour8-header">
          <span class="tour8-badge" id="t8badge"></span>
          <span class="tour8-dots" id="t8dots"></span>
          <span class="tour8-count" id="t8count"></span>
        </div>
        <h3 class="tour8-title" id="t8title"></h3>
        <p class="tour8-desc" id="t8desc"></p>
        <div class="tour8-footer">
          <button class="tour8-skip" id="t8skip"></button>
          <div class="tour8-nav">
            <button class="tour8-prev" id="t8prev"></button>
            <button class="tour8-next" id="t8next"></button>
          </div>
        </div>
      </div>
    `;
    b.appendChild(this.els.pop);

    b.style.overflow = 'hidden';

    const self = this;

    this.els.overlay.addEventListener('click', () => self._finish());

    this._keyHandler = (e) => {
      if (!self.active) return;
      if (e.key === 'Escape') self._finish();
      if (e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); self._next(); }
      if (e.key === 'ArrowLeft') self._prev();
    };
    document.addEventListener('keydown', this._keyHandler);

    this._resizeHandler = () => {
      if (self._resizeRaf) cancelAnimationFrame(self._resizeRaf);
      self._resizeRaf = requestAnimationFrame(() => self._reposition());
    };
    window.addEventListener('resize', this._resizeHandler, { passive: true });

    this._scrollHandler = () => {
      if (self._scrollRaf) return;
      self._scrollRaf = requestAnimationFrame(() => {
        self._scrollRaf = null;
        self._reposition();
      });
    };
    window.addEventListener('scroll', this._scrollHandler, { passive: true });

    this._resizeObs = new MutationObserver((mutations) => {
      if (!self.active || self._repositioning) return;

      const relevant = mutations.some((m) => {
        const target = m.target;
        if (
          target === self.els.overlay ||
          target === self.els.spot ||
          target === self.els.pop ||
          (self.els.pop && self.els.pop.contains(target))
        ) {
          return false;
        }
        return true;
      });

      if (relevant) self._reposition();
    });

    this._resizeObs.observe(b, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style'],
    });

    const pop = this.els.pop;
    pop.querySelector('#t8next').addEventListener('click', () => self._next());
    pop.querySelector('#t8prev').addEventListener('click', () => self._prev());
    pop.querySelector('#t8skip').addEventListener('click', () => self._finish());

    requestAnimationFrame(() => {
      self.els.overlay.classList.add('tour8-on');
      self.els.pop.classList.add('tour8-on');
    });
  }

  // ── Show Step ───────────────────────────────────────────────

  _show(idx) {
    const s = STEPS[idx];
    if (!s) { this._finish(); return; }
    this.step = idx;

    const total = STEPS.length;
    const pop = this.els.pop;
    const spot = this.els.spot;

    pop.querySelector('#t8badge').textContent = idx + 1;
    pop.querySelector('#t8title').textContent = tr(s.titleKey);
    pop.querySelector('#t8desc').textContent = tr(s.descKey);
    pop.querySelector('#t8count').textContent = `${idx + 1}/${total}`;

    const dotsEl = pop.querySelector('#t8dots');
    dotsEl.innerHTML = '';
    for (let d = 0; d < total; d++) {
      const dot = document.createElement('span');
      dot.className = 'tour8-dot' + (d === idx ? ' tour8-dot-active' : '');
      dotsEl.appendChild(dot);
    }

    const prevBtn = pop.querySelector('#t8prev');
    const nextBtn = pop.querySelector('#t8next');
    const skipBtn = pop.querySelector('#t8skip');

    prevBtn.textContent = tr('tourPrev');
    nextBtn.textContent = idx === total - 1 ? tr('tourFinish') : tr('tourNext');
    skipBtn.textContent = tr('tourSkip');

    prevBtn.style.display = idx === 0 ? 'none' : '';

    if (s.centered || !s.target) {
      spot.style.display = 'none';
      this.els.spot.classList.remove('tour8-spot-on');
      this._centerPop();
    } else {
      const el = document.querySelector(s.target);
      if (el) {
        this._highlightAndPosition(el);
      } else {
        spot.style.display = 'none';
        this.els.spot.classList.remove('tour8-spot-on');
        this._centerPop();
      }
    }
  }

  // ── Positioning ─────────────────────────────────────────────

  _highlightAndPosition(el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    let scrollSettleTimer = null;
    let maxWaitTimer = null;
    let done = false;

    const proceed = () => {
      if (done) return;
      done = true;
      clearTimeout(scrollSettleTimer);
      clearTimeout(maxWaitTimer);
      window.removeEventListener('scroll', onScroll, true);
      this._drawSpotlight(el);
      this._positionPopover(el);
    };

    const onScroll = () => {
      clearTimeout(scrollSettleTimer);
      scrollSettleTimer = setTimeout(proceed, 80);
    };

    window.addEventListener('scroll', onScroll, { passive: true, capture: true });
    scrollSettleTimer = setTimeout(proceed, 80);
    maxWaitTimer = setTimeout(proceed, 600);
  }

  _drawSpotlight(el) {
    const r = el.getBoundingClientRect();
    const pad = 10;
    const spot = this.els.spot;

    spot.style.display = 'block';
    spot.style.top = `${r.top - pad}px`;
    spot.style.left = `${r.left - pad}px`;
    spot.style.width = `${r.width + pad * 2}px`;
    spot.style.height = `${r.height + pad * 2}px`;

    requestAnimationFrame(() => spot.classList.add('tour8-spot-on'));
  }

  _positionPopover(el) {
    const pop = this.els.pop;
    const r = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const isRtl = document.documentElement.dir === 'rtl';

    pop.style.top = 'auto';
    pop.style.left = 'auto';
    pop.style.right = 'auto';
    pop.style.bottom = 'auto';
    pop.style.transform = 'none';

    const ph = pop.offsetHeight || 200;
    const pw = pop.offsetWidth || 340;
    const gap = 12;

    if (vw < 520) {
      pop.style.top = '50%';
      pop.style.left = '50%';
      pop.style.transform = 'translate(-50%, -50%)';
      return;
    }

    const spaceBelow = vh - r.bottom - gap;
    const spaceAbove = r.top - gap;
    let topVal = null;
    let bottomVal = null;
    let verticalCenter = false;

    if (spaceBelow >= ph + 10) {
      topVal = r.bottom + gap;
    } else if (spaceAbove >= ph + 10) {
      bottomVal = vh - r.top + gap;
    } else {
      verticalCenter = true;
    }

    let leftVal = null;
    let rightVal = null;
    let horizontalCenter = false;

    if (vw < 768) {
      horizontalCenter = true;
    } else if (isRtl) {
      rightVal = Math.max(16, vw - r.right);
    } else {
      leftVal = Math.max(16, r.left);
    }

    const tx = horizontalCenter ? '-50%' : '0';
    const ty = verticalCenter ? '-50%' : '0';

    if (tx !== '0' || ty !== '0') {
      pop.style.transform = `translate(${tx}, ${ty})`;
    }

    if (verticalCenter) {
      pop.style.top = '50%';
    } else if (topVal !== null) {
      pop.style.top = `${topVal}px`;
    } else if (bottomVal !== null) {
      pop.style.bottom = `${bottomVal}px`;
    }

    if (horizontalCenter) {
      pop.style.left = '50%';
    } else if (leftVal !== null) {
      pop.style.left = `${leftVal}px`;
    } else if (rightVal !== null) {
      pop.style.right = `${rightVal}px`;
    }

    requestAnimationFrame(() => {
      if (!this.active) return;

      const pr = pop.getBoundingClientRect();
      let currentLeft = parseFloat(pop.style.left) || 0;
      let currentTop = parseFloat(pop.style.top) || 0;

      if (pr.right > vw - 12) {
        if (pop.style.left !== 'auto') {
          pop.style.left = `${currentLeft - (pr.right - (vw - 12))}px`;
        } else {
          pop.style.right = '12px';
        }
      }
      if (pr.left < 12) {
        pop.style.left = '12px';
        pop.style.right = 'auto';
      }
      if (pr.bottom > vh - 12) {
        if (pop.style.top !== 'auto') {
          pop.style.top = `${currentTop - (pr.bottom - (vh - 12))}px`;
        } else {
          pop.style.bottom = '12px';
        }
      }
      if (pr.top < 12) {
        pop.style.top = '12px';
        pop.style.bottom = 'auto';
      }
    });
  }

  _centerPop() {
    const pop = this.els.pop;
    pop.style.top = '50%';
    pop.style.left = '50%';
    pop.style.right = 'auto';
    pop.style.bottom = 'auto';
    pop.style.transform = 'translate(-50%, -50%)';
  }

  _reposition() {
    if (!this.active) return;

    this._repositioning = true;
    const s = STEPS[this.step];
    if (!s) {
      this._repositioning = false;
      return;
    }

    if (s.centered || !s.target) {
      this._centerPop();
      this._repositioning = false;
      return;
    }

    const el = document.querySelector(s.target);
    if (!el) {
      this._centerPop();
      this._repositioning = false;
      return;
    }

    this._drawSpotlight(el);
    this._positionPopover(el);

    requestAnimationFrame(() => {
      this._repositioning = false;
    });
  }

  // ── Navigation ──────────────────────────────────────────────

  _next() {
    if (this.step >= STEPS.length - 1) { this._finish(); return; }
    this._slide(this.step + 1);
  }

  _prev() {
    if (this.step > 0) this._slide(this.step - 1);
  }

  _slide(to) {
    const pop = this.els.pop;
    const nextStep = STEPS[to];
    const hasTarget = nextStep && !nextStep.centered && nextStep.target;

    if (this._slideTimer1) { clearTimeout(this._slideTimer1); this._slideTimer1 = null; }
    if (this._slideTimer2) { clearTimeout(this._slideTimer2); this._slideTimer2 = null; }

    pop.style.opacity = '0';
    this.els.spot.classList.add('tour8-spot-dim');

    const delay = hasTarget ? 500 : 200;

    this._slideTimer1 = setTimeout(() => {
      this._slideTimer1 = null;
      if (!this.active) return;

      this._show(to);
      this.els.spot.classList.remove('tour8-spot-dim');

      const fadeDelay = hasTarget ? 360 : 50;
      this._slideTimer2 = setTimeout(() => {
        this._slideTimer2 = null;
        if (!this.active) return;
        pop.style.opacity = '1';
      }, fadeDelay);
    }, delay);
  }

  // ── Finish / Destroy ────────────────────────────────────────

  _finish() {
    markDone();
    this._destroy();
  }

  _destroy() {
    this.active = false;

    if (this._slideTimer1) { clearTimeout(this._slideTimer1); this._slideTimer1 = null; }
    if (this._slideTimer2) { clearTimeout(this._slideTimer2); this._slideTimer2 = null; }

    const o = this.els.overlay;
    const s = this.els.spot;
    const p = this.els.pop;

    if (o) o.classList.remove('tour8-on');
    if (p) p.classList.remove('tour8-on');
    if (s) s.classList.remove('tour8-spot-on');

    document.removeEventListener('keydown', this._keyHandler);
    window.removeEventListener('resize', this._resizeHandler);
    window.removeEventListener('scroll', this._scrollHandler);
    if (this._resizeObs) this._resizeObs.disconnect();

    document.body.style.overflow = '';

    setTimeout(() => {
      [o, s, p].forEach((el) => {
        if (el && el.parentNode) el.parentNode.removeChild(el);
      });
    }, 350);
  }

  restart() {
    try { safeStorageRemove(STORAGE_KEY); } catch (e) {}
    if (this.active) this._destroy();
    this.step = 0;
    this.start();
  }
}

// ════════════════════════════════════════════════════════════════
// CSS
// ════════════════════════════════════════════════════════════════

function injectCSS() {
  if (document.getElementById('tour8css')) return;
  const s = document.createElement('style');
  s.id = 'tour8css';
  s.textContent = `
    .tour8-overlay{position:fixed;inset:0;z-index:9998;background:rgba(0,0,0,0);transition:background .35s ease;pointer-events:auto}
    .tour8-overlay.tour8-on{background:rgba(0,0,0,.65)}
    .tour8-spot{position:fixed;z-index:9999;pointer-events:none;border:2px solid #38bdf8;border-radius:14px;opacity:0;transition:all .3s cubic-bezier(.4,0,.2,1);box-shadow:0 0 0 4px rgba(56,189,248,.12),0 0 24px rgba(56,189,248,.18)}
    .tour8-spot.tour8-spot-on{opacity:1;animation:tour8pulse 2.5s ease-in-out infinite}
    .tour8-spot.tour8-spot-dim{opacity:.1}
    @keyframes tour8pulse{0%,100%{box-shadow:0 0 0 4px rgba(56,189,248,.12),0 0 20px rgba(56,189,248,.15)}50%{box-shadow:0 0 0 8px rgba(56,189,248,.22),0 0 32px rgba(56,189,248,.3)}}
    .tour8-pop{position:fixed;z-index:10001;width:360px;max-width:calc(100vw - 32px);opacity:0;transition:opacity .25s ease}
    .tour8-pop.tour8-on{opacity:1}
    .tour8-pop-inner{background:linear-gradient(160deg,rgba(15,23,42,.97),rgba(30,41,59,.95));backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,.1);border-radius:18px;padding:22px;box-shadow:0 24px 60px rgba(0,0,0,.5),0 0 0 1px rgba(255,255,255,.05)}
    .tour8-header{display:flex;align-items:center;gap:10px;margin-bottom:14px}
    .tour8-badge{width:28px;height:28px;border-radius:9px;background:linear-gradient(135deg,#38bdf8,#0ea5e9);color:#fff;font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 10px rgba(56,189,248,.35);flex-shrink:0}
    .tour8-dots{display:flex;gap:5px;align-items:center;flex:1;justify-content:center}
    .tour8-dot{width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,.15);transition:all .3s ease}
    .tour8-dot-active{background:#38bdf8;width:20px;border-radius:4px;box-shadow:0 0 8px rgba(56,189,248,.4)}
    .tour8-count{font-size:11px;color:rgba(255,255,255,.25);font-weight:500;flex-shrink:0}
    .tour8-title{font-size:16px;font-weight:700;color:#fff;margin:0 0 8px;line-height:1.45}
    .tour8-desc{font-size:13px;color:rgba(255,255,255,.5);line-height:1.75;margin:0 0 18px}
    .tour8-footer{display:flex;align-items:center;justify-content:space-between}
    .tour8-nav{display:flex;gap:6px}
    .tour8-skip{background:none;border:none;color:rgba(255,255,255,.25);font-size:12px;cursor:pointer;padding:6px 10px;border-radius:6px;transition:all .2s;font-family:inherit}
    .tour8-skip:hover{color:rgba(255,255,255,.5);background:rgba(255,255,255,.05)}
    .tour8-prev,.tour8-next{font-size:13px;font-weight:600;cursor:pointer;padding:8px 20px;border-radius:10px;transition:all .2s;font-family:inherit;border:none}
    .tour8-prev{background:rgba(255,255,255,.06);color:rgba(255,255,255,.65);border:1px solid rgba(255,255,255,.08)}
    .tour8-prev:hover{background:rgba(255,255,255,.12)}
    .tour8-next{background:linear-gradient(135deg,#38bdf8,#0ea5e9);color:#fff;box-shadow:0 4px 14px rgba(56,189,248,.3)}
    .tour8-next:hover{transform:translateY(-1px);box-shadow:0 6px 18px rgba(56,189,248,.4)}
    .tour-restart-btn{background:rgba(56,189,248,.1);border:1px solid rgba(56,189,248,.2);color:#38bdf8;font-size:12px;font-weight:500;padding:6px 14px;border-radius:8px;cursor:pointer;transition:all .2s;font-family:inherit;display:inline-flex;align-items:center;gap:4px}
    .tour-restart-btn:hover{background:rgba(56,189,248,.2);border-color:rgba(56,189,248,.4)}
    @media(max-width:767px){.tour8-pop{width:calc(100vw - 48px)}.tour8-pop-inner{padding:18px;border-radius:16px}.tour8-title{font-size:15px}.tour8-desc{font-size:12.5px;line-height:1.65}}
    @media(max-width:519px){.tour8-pop{width:calc(100vw - 28px);max-width:none}.tour8-pop-inner{padding:16px;border-radius:14px}.tour8-title{font-size:14px}.tour8-desc{font-size:12px;margin-bottom:14px}.tour8-badge{width:24px;height:24px;font-size:11px;border-radius:7px}.tour8-prev,.tour8-next{padding:7px 16px;font-size:12px;border-radius:8px}.tour8-skip{font-size:11px;padding:5px 8px}}
    @media(max-width:380px){.tour8-pop{width:calc(100vw - 16px)}.tour8-pop-inner{padding:14px}.tour8-footer{flex-direction:column-reverse;gap:8px}.tour8-nav{width:100%}.tour8-prev,.tour8-next{flex:1;text-align:center}.tour8-skip{align-self:center}}
    [dir="ltr"] .tour8-pop-inner{text-align:left}
    [dir="rtl"] .tour8-pop-inner{text-align:right}
  `;
  document.head.appendChild(s);
}

// ════════════════════════════════════════════════════════════════
// Bootstrap
// ════════════════════════════════════════════════════════════════

injectCSS();
export const onboardingTour = new Tour();
window.onboardingTour = onboardingTour;
