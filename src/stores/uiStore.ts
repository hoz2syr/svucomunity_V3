/**
 * @module stores/uiStore
 *
 * @deprecated Zustand store for global UI state (theme, mobile menu, sidebar).
 *
 * PLANNED — not wired to any component yet. Currently only exported; no consumer
 * in `src/` imports `useUiStore`. This is intentional "Zustand drift": the store
 * is reserved for a future sidebar layout toggle and theme switcher.
 *
 * When wiring up:
 *   1. Replace `dark` theme default with system preference detection.
 *   2. Move `sidebarOpen` state into a layout context if a sidebar is added.
 *   3. Remove or promote this file once a consumer exists.
 *
 * Do NOT delete this file until a component actually uses it — removing it will
 * silently break any planned feature that imports it.
 */

import { create } from 'zustand';

type Theme = 'dark' | 'light';

export type UiState = {
  theme: Theme;
  mobileMenuOpen: boolean;
  sidebarOpen: boolean;
};

export type UiActions = {
  setTheme: (theme: Theme) => void;
  toggleMobileMenu: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
};

export type UiStore = UiState & UiActions;

export const useUiStore = create<UiStore>((set) => ({
  theme: 'dark',
  mobileMenuOpen: false,
  sidebarOpen: false,
  setTheme: (theme) => set({ theme }),
  toggleMobileMenu: () => set((s) => ({ mobileMenuOpen: !s.mobileMenuOpen })),
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
