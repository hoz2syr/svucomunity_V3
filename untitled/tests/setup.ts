import { vi } from 'vitest';

Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: vi.fn(() => null),
  configurable: true,
});

Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
  configurable: true,
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
