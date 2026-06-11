export function showTooltip(el, text) {
  el.setAttribute('title', text);
}

export function hideTooltip(el) {
  el.removeAttribute('title');
}
