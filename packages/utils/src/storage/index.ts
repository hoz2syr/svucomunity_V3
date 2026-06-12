export function setItem(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getItem<T>(key: string): T | null {
  const item = localStorage.getItem(key);
  try {
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
}

export function removeItem(key: string): void {
  localStorage.removeItem(key);
}
