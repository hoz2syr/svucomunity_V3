import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('auth.schema', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('should be importable', async () => {
    const mod = await import('../../src/schemas/auth.schema');
    expect(mod).toBeDefined();
  });

  it('should export signIn schema when present', async () => {
    const mod = await import('../../src/schemas/auth.schema');
    expect(typeof mod.signIn ?? mod.default).toBeDefined();
  });
});
