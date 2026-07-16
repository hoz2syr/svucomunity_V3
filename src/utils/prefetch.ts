const prefetchCache = new Map<string, () => Promise<unknown>>();
const pendingPrefetches = new Set<string>();
const hoverTimers = new Map<string, ReturnType<typeof setTimeout>>();

export const prefetchRoute = (key: string, importFn: () => Promise<unknown>) => {
  if (prefetchCache.has(key)) return;
  prefetchCache.set(key, importFn);

  if ('requestIdleCallback' in window) {
    (window as Window & { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(() => {
      importFn();
    });
  } else {
    setTimeout(importFn, 0);
  }
};

export const getPrefetch = (key: string) => prefetchCache.get(key);

export const prefetchOnHover = (key: string, importFn: () => Promise<unknown>) => {
  if (prefetchCache.has(key) || pendingPrefetches.has(key)) return {};

  const handleMouseEnter = () => {
    if (hoverTimers.has(key)) return;

    const timer = setTimeout(() => {
      hoverTimers.delete(key);
      pendingPrefetches.add(key);
      importFn().finally(() => {
        pendingPrefetches.delete(key);
      });
    }, 100);

    hoverTimers.set(key, timer);
  };

  const handleMouseLeave = () => {
    if (hoverTimers.has(key)) {
      clearTimeout(hoverTimers.get(key)!);
      hoverTimers.delete(key);
    }
  };

  return { onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave };
};
