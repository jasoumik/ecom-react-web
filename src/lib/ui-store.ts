import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIStore {
  isDarkMode: boolean;
  headerHeight: number;
  isMobileMenuOpen: boolean;
  isSearchOverlayOpen: boolean;
  isMobileCategoriesOpen: boolean;
  setDarkMode: (value: boolean) => void;
  setHeaderHeight: (height: number) => void;
  setMobileMenuOpen: (value: boolean) => void;
  setSearchOverlayOpen: (value: boolean) => void;
  setMobileCategoriesOpen: (value: boolean) => void;
  toggleDarkMode: () => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      isDarkMode: false,
      headerHeight: 60,
      isMobileMenuOpen: false,
      isSearchOverlayOpen: false,
      isMobileCategoriesOpen: false,
      setDarkMode: (value) => set({ isDarkMode: value }),
      setHeaderHeight: (height) => set({ headerHeight: height }),
      setMobileMenuOpen: (value) => set({ isMobileMenuOpen: value }),
      setSearchOverlayOpen: (value) => set({ isSearchOverlayOpen: value }),
      setMobileCategoriesOpen: (value) => set({ isMobileCategoriesOpen: value }),
      toggleDarkMode: () => set({ isDarkMode: !get().isDarkMode }),
    }),
    {
      name: "ui-storage",
      partialize: (state) => ({ isDarkMode: state.isDarkMode }),
    }
  )
);

