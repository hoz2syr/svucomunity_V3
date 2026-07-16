const prefetchCache = new Map<string, () => Promise<unknown>>();
const pendingPrefetches = new Set<string>();

export const prefetchRoute = (key: string, importFn: () => Promise<unknown>) => {
  if (prefetchCache.has(key)) return;
  prefetchCache.set(key, importFn);
  importFn();
};

export const getPrefetch = (key: string) => prefetchCache.get(key);

export const prefetchOnHover = (key: string, importFn: () => Promise<unknown>) => {
  if (prefetchCache.has(key) || pendingPrefetches.has(key)) return;

  const handleMouseEnter = () => {
    pendingPrefetches.add(key);
    importFn().finally(() => {
      pendingPrefetches.delete(key);
    });
  };

  return { onMouseEnter: handleMouseEnter };
};
