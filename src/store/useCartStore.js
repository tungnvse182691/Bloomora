import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const sameLine = (a, productId, size) => a.productId === productId && a.size === size;

export const useCartStore = create(
  persist(
    (set, get) => ({
      // state
      items: [], // [{ productId, slug, name, image, price, size, qty, giftWrap, note }]
      promo: null, // { code, discountAmount } | null
      shippingFee: 0,

      // actions
      addItem: (item) =>
        set((s) => {
          const found = s.items.find((a) => sameLine(a, item.productId, item.size));
          if (found) {
            return {
              items: s.items.map((a) =>
                sameLine(a, item.productId, item.size)
                  ? { ...a, qty: a.qty + (item.qty || 1) }
                  : a,
              ),
            };
          }
          return {
            items: [...s.items, { qty: 1, giftWrap: false, note: '', ...item }],
          };
        }),

      updateQty: (productId, size, qty) =>
        set((s) => ({
          items: qty <= 0
            ? s.items.filter((a) => !sameLine(a, productId, size))
            : s.items.map((a) => (sameLine(a, productId, size) ? { ...a, qty } : a)),
        })),

      removeItem: (productId, size) =>
        set((s) => ({ items: s.items.filter((a) => !sameLine(a, productId, size)) })),

      clearCart: () => set({ items: [], promo: null, shippingFee: 0 }),

      setPromo: (promo) => set({ promo }),
      clearPromo: () => set({ promo: null }),

      setShippingFee: (fee) => set({ shippingFee: Number(fee) || 0 }),

      // computed
      subtotal: () => get().items.reduce((sum, a) => sum + a.price * a.qty, 0),
      count: () => get().items.reduce((sum, a) => sum + a.qty, 0),
      discount: () => get().promo?.discountAmount || 0,
      total: () => get().subtotal() - get().discount() + get().shippingFee,
    }),
    {
      name: 'bloomora-cart',
      partialize: (s) => ({ items: s.items, promo: s.promo, shippingFee: s.shippingFee }),
    },
  ),
);
