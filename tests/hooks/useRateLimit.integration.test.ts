import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import React from 'react';

describe('useRateLimit', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('should be importable and hook is callable', async () => {
    const mod = await import('../../src/hooks/useRateLimit');
    expect(typeof mod.useRateLimit).toBe('function');
    const { result } = renderHook(() => mod.useRateLimit({ maxAttempts: 5, windowMs: 60000 }));
    expect(result).toBeDefined();
  });
});
