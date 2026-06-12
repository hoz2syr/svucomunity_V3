import { buildTourDOM } from './tour-ui.js';
import { bindEventHandlers, unbindEventHandlers } from './tour-handlers.js';
import { injectCSS } from './tour-css.js';
import { isDone, markDone, STORAGE_KEY } from './tour-persistence.js';
import { tr, STEPS } from './tour-steps.js';

export class Tour {
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

  _build() {
    const b = document.body;

    const built = buildTourDOM();
    this.els.overlay = built.overlay;
    this.els.spot = built.spot;
    this.els.pop = built.pop;

    b.style.overflow = 'hidden';

    bindEventHandlers(this);
  }

  _show(idx) {
    const s = STEPS[idx];
    if (!s) { this._finish(); return; }
    this.step = idx;

    const { pop, spot } = this.els;

    pop.querySelector('#t8badge').textContent = idx + 1;
    pop.querySelector('#t8title').textContent = tr(s.titleKey);
    pop.querySelector('#t8desc').textContent = tr(s.descKey);

    const prevBtn = pop.querySelector('#t8prev');
    const nextBtn = pop.querySelector('#t8next');
    const skipBtn = pop.querySelector('#t8skip');

    prevBtn.textContent = tr('tourPrev');
    nextBtn.textContent = idx === STEPS.length - 1 ? tr('tourFinish') : tr('tourNext');
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

    unbindEventHandlers(this);

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

injectCSS();
export const onboardingTour = new Tour();
window.onboardingTour = onboardingTour;
