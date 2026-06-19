import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useInView } from '../../src/hooks/useInView';

describe('useInView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const mockObserver = {
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    };
    vi.stubGlobal('IntersectionObserver', vi.fn(() => mockObserver));
  });

  it('initializes with isInView false', () => {
    const { result } = renderHook(() => useInView());
    expect(result.current.isInView).toBe(false);
    expect(result.current.ref).toBeDefined();
  });

  it('uses default options', () => {
    const { result } = renderHook(() => useInView());
    expect(result.current.ref.current).toBeNull();
  });

  it('accepts custom threshold', () => {
    const { result } = renderHook(() => useInView({ threshold: 0.5 }));
    expect(result.current.isInView).toBe(false);
  });

  it('accepts custom rootMargin', () => {
    const { result } = renderHook(() => useInView({ rootMargin: '10px' }));
    expect(result.current.isInView).toBe(false);
  });

  it('accepts once option', () => {
    const { result } = renderHook(() => useInView({ once: false }));
    expect(result.current.isInView).toBe(false);
  });

  it('returns same ref on re-render', () => {
    const { result, rerender } = renderHook(() => useInView());
    const firstRef = result.current.ref;
    rerender();
    expect(result.current.ref).toBe(firstRef);
  });

  it('updates isInView when intersecting', () => {
    const { result } = renderHook(() => useInView({ once: false }));
    expect(result.current.isInView).toBe(false);
  });

  it('uses default threshold of 0.15', () => {
    const { result } = renderHook(() => useInView());
    expect(result.current.isInView).toBe(false);
  });
});
