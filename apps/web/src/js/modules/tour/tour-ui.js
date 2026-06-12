import { tr, STEPS } from './tour-steps.js';

export function createElement(tag, cls) {
  const e = document.createElement(tag);
  e.className = cls;
  return e;
}

export function buildTourDOM() {
  const b = document.body;

  const overlay = createElement('div', 'tour8-overlay');
  b.appendChild(overlay);

  const spot = createElement('div', 'tour8-spot');
  b.appendChild(spot);

  const pop = createElement('div', 'tour8-pop');
  pop.innerHTML = `
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
  b.appendChild(pop);

  return { overlay, spot, pop };
}

export function showStepUI(els, idx) {
  const s = STEPS[idx];
  if (!s) return null;

  const total = STEPS.length;
  const { pop } = els;

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

  return { prevBtn, nextBtn, skipBtn };
}
