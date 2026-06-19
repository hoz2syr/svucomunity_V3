export function createMockSupabase(overrides = {}) {
  const chain = () => chain;
  const single = vi.fn();
  const maybeSingle = vi.fn();

  const base = {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single,
          maybeSingle,
          ...chain(),
        })),
        ...chain(),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          ...chain(),
        })),
      })),
      insert: vi.fn(() => ({
        ...chain(),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          ...chain(),
        })),
        neq: vi.fn(() => ({
          ...chain(),
        })),
      })),
      ...chain(),
    })),
    auth: {
      getUser: vi.fn(() => ({
        data: { user: null },
        error: null,
      })),
      ...chain(),
    },
    ...overrides,
  };

  return { ...base, single, maybeSingle };
}
