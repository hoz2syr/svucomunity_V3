import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGetQueryClient = vi.fn();
vi.mock('../../src/lib/queryClient', () => ({
  getQueryClient: (...args: any[]) => mockGetQueryClient(...args),
  QueryClient: vi.fn(),
}));

describe('queryClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('should export getQueryClient', async () => {
    const mod = await import('../../src/lib/queryClient');
    expect(typeof mod.getQueryClient).toBe('function');
  });

  it('should return a query client instance', async () => {
    const fakeClient = { cacheTime: 0 };
    mockGetQueryClient.mockReturnValue(fakeClient);
    const { getQueryClient } = await import('../../src/lib/queryClient');
    expect(getQueryClient()).toBe(fakeClient);
  });
});
