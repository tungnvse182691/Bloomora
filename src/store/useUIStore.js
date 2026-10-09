import { create } from 'zustand';

// UI state tạm thời — không persist
export const useUIStore = create((set) => ({
  miniCartOpen: false,
  setMiniCartOpen: (open) => set({ miniCartOpen: open }),

  searchOpen: false,
  setSearchOpen: (open) => set({ searchOpen: open }),

  quickViewSlug: null,
  setQuickViewSlug: (slug) => set({ quickViewSlug: slug }),

  mobileNavOpen: false,
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
}));
