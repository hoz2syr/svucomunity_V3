import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

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

vi.mock('html2pdf.js', () => {
  const save = vi.fn().mockResolvedValue(undefined);
  return {
    __esModule: true,
    default: () => ({
      set: () => ({ from: () => ({ save }) }),
    }),
  };
});

  vi.mock('motion/react', () => {
    const React = require('react');
    const makeEl = (tag: string) => (props: Record<string, unknown>, ref: React.Ref<any>) =>
      React.createElement(tag, { ...props, ref, style: { ...(props?.style || {}), opacity: 1 } }, props?.children);
    return {
      motion: { div: makeEl('div'), span: makeEl('span'), p: makeEl('p'), header: makeEl('header'), section: makeEl('section'), article: makeEl('article'), main: makeEl('main'), aside: makeEl('aside'), nav: makeEl('nav'), footer: makeEl('footer'), button: makeEl('button'), form: makeEl('form'), label: makeEl('label'), input: makeEl('input'), textarea: makeEl('textarea'), select: makeEl('select'), option: makeEl('option'), img: makeEl('img'), svg: makeEl('svg'), path: makeEl('path'), a: makeEl('a') },
      AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    };
  });

