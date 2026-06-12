export function bindEventHandlers(tour) {
  const { els } = tour;
  const pop = els.pop;

  els.overlay.addEventListener('click', () => tour._finish());

  tour._keyHandler = (e) => {
    if (!tour.active) return;
    if (e.key === 'Escape') tour._finish();
    if (e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); tour._next(); }
    if (e.key === 'ArrowLeft') tour._prev();
  };
  document.addEventListener('keydown', tour._keyHandler);

  tour._resizeHandler = () => {
    if (tour._resizeRaf) cancelAnimationFrame(tour._resizeRaf);
    tour._resizeRaf = requestAnimationFrame(() => tour._reposition());
  };
  window.addEventListener('resize', tour._resizeHandler, { passive: true });

  tour._scrollHandler = () => {
    if (tour._scrollRaf) return;
    tour._scrollRaf = requestAnimationFrame(() => {
      tour._scrollRaf = null;
      tour._reposition();
    });
  };
  window.addEventListener('scroll', tour._scrollHandler, { passive: true });

  tour._resizeObs = new MutationObserver((mutations) => {
    if (!tour.active || tour._repositioning) return;

    const relevant = mutations.some((m) => {
      const target = m.target;
      if (
        target === els.overlay ||
        target === els.spot ||
        target === els.pop ||
        (els.pop && els.pop.contains(target))
      ) {
        return false;
      }
      return true;
    });

    if (relevant) tour._reposition();
  });

  tour._resizeObs.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'style'],
  });

  pop.querySelector('#t8next').addEventListener('click', () => tour._next());
  pop.querySelector('#t8prev').addEventListener('click', () => tour._prev());
  pop.querySelector('#t8skip').addEventListener('click', () => tour._finish());

  requestAnimationFrame(() => {
    els.overlay.classList.add('tour8-on');
    els.pop.classList.add('tour8-on');
  });
}

export function unbindEventHandlers(tour) {
  document.removeEventListener('keydown', tour._keyHandler);
  window.removeEventListener('resize', tour._resizeHandler);
  window.removeEventListener('scroll', tour._scrollHandler);
  if (tour._resizeObs) tour._resizeObs.disconnect();
}
