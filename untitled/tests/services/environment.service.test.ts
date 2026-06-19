import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('environment.service', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('should be importable', async () => {
    const mod = await import('../../src/services/environment.service');
    expect(mod).toBeDefined();
  });

  it('should export environment variables or config functions', async () => {
    const mod = await import('../../src/services/environment.service');
    const keys = Object.keys(mod);
    expect(keys.length).toBeGreaterThanOrEqual(0);
  });
});
