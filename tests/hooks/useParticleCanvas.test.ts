import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useParticleCanvas } from '../../src/hooks/useParticleCanvas';

const createMatchMediaMock = (matches = false) =>
  vi.fn().mockImplementation((_query: string) => ({
    matches,
    media: _query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));

const mockCtx = () => ({
  fillRect: vi.fn(),
  beginPath: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
  setTransform: vi.fn(),
  scale: vi.fn(),
  clearRect: vi.fn(),
});

describe('useParticleCanvas', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: createMatchMediaMock(false),
    });
    Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 768, configurable: true });
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      value: vi.fn(() => mockCtx()),
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns canvasRef object with default options', () => {
    const { result } = renderHook(() => useParticleCanvas());
    expect(result.current.canvasRef).toBeDefined();
    expect(result.current.canvasRef.current).toBeNull();
    expect(result.current.particleCount).toBe(80);
  });

  it('supports custom particleCount', () => {
    const { result } = renderHook(() => useParticleCanvas({ particleCount: 200 }));
    expect(result.current.particleCount).toBe(200);
  });

  it('charRefs is undefined when enableTextAssemble is false', () => {
    const { result } = renderHook(() => useParticleCanvas({ enableTextAssemble: false }));
    expect(result.current.charRefs).toBeUndefined();
  });

  it('charRefs is undefined with default options', () => {
    const { result } = renderHook(() => useParticleCanvas());
    expect(result.current.charRefs).toBeUndefined();
  });

  it('accepts custom textChars option', () => {
    const { result } = renderHook(() => useParticleCanvas({ textChars: ['A', 'B'] }));
    expect(result.current.particleCount).toBe(80);
  });

  it('accepts onReady callback without throwing', () => {
    const onReady = vi.fn();
    const { result } = renderHook(() => useParticleCanvas({ onReady }));
    expect(result.current.canvasRef).toBeDefined();
  });

  it('returns same canvasRef across rerenders', () => {
    const { result, rerender } = renderHook(() => useParticleCanvas());
    const first = result.current.canvasRef;
    rerender();
    expect(result.current.canvasRef).toBe(first);
  });

  it('reducedMotion is true when matchMedia matches reduce', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: createMatchMediaMock(true),
    });
    const { result } = renderHook(() => useParticleCanvas());
    expect(result.current.reducedMotion).toBe(true);
  });
});
