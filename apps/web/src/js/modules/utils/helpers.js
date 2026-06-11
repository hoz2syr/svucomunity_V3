export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US');
}

export function debounce(fn, ms = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

export function initRouter() {
  // TODO: simple hash router
}
