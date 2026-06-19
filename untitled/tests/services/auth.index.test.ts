import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('auth.services', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('auth services index should be importable', async () => {
    const mod = await import('@/src/services/auth.service');
    expect(Object.keys(mod).length).toBeGreaterThan(0);
  });
});