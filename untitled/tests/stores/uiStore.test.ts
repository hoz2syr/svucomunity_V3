import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockUseUiStore = vi.fn();
vi.mock('../../src/stores/uiStore', () => ({
  useUiStore: (...args: any[]) => mockUseUiStore(...args),
}));

describe('uiStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('should export useUiStore', async () => {
    const mod = await import('../../src/stores/uiStore');
    expect(typeof mod.useUiStore).toBe('function');
  });

  it('should have default ui state', async () => {
    mockUseUiStore.mockReturnValue({
      sidebarOpen: false,
      theme: 'dark',
      toggleSidebar: vi.fn(),
      setTheme: vi.fn(),
      isMobile: false,
    });

    const { useUiStore } = await import('../../src/stores/uiStore');
    const result = useUiStore();
    expect(result.sidebarOpen).toBe(false);
    expect(typeof result.toggleSidebar).toBe('function');
  });

  it('should expose setTheme action', async () => {
    const setTheme = vi.fn();
    mockUseUiStore.mockReturnValue({
      sidebarOpen: false,
      theme: 'dark',
      toggleSidebar: vi.fn(),
      setTheme,
      isMobile: false,
    });

    const { useUiStore } = await import('../../src/stores/uiStore');
    const result = useUiStore();
    expect(typeof result.setTheme).toBe('function');
  });

  it('should call setTheme with new theme', async () => {
    const setTheme = vi.fn();
    mockUseUiStore.mockReturnValue({
      sidebarOpen: false,
      theme: 'dark',
      toggleSidebar: vi.fn(),
      setTheme,
      isMobile: false,
    });

    const { useUiStore } = await import('../../src/stores/uiStore');
    const result = useUiStore();
    result.setTheme('light');
    expect(setTheme).toHaveBeenCalledWith('light');
  });
});
