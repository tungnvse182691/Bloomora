import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const MAX_RECENT = 8;

// Lưu slug các sản phẩm đã xem gần đây (tối đa 8, mới nhất trước)
export const useRecentStore = create(
  persist(
    (set, get) => ({
      slugs: [],
      push: (slug) => {
        if (!slug) return;
        const slugs = [slug, ...get().slugs.filter((s) => s !== slug)].slice(0, MAX_RECENT);
        set({ slugs });
      },
      clear: () => set({ slugs: [] }),
    }),
    { name: 'bloomora_recent' },
  ),
);
