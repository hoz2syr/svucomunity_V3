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
