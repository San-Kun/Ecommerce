import { create } from "zustand";
import { persist } from "zustand/middleware";

export type RecentProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  unit: string;
  image: string | null;
};

const MAX_ITEMS = 8;

type RecentlyViewedState = {
  items: RecentProduct[];
  add: (product: RecentProduct) => void;
  clear: () => void;
};

/**
 * Menyimpan produk yang baru dilihat user di localStorage (persist). Murni
 * client-side, tidak menyentuh database -- cukup untuk fitur "baru dilihat".
 */
export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (product) => {
        const existing = get().items.filter((p) => p.id !== product.id);
        set({ items: [product, ...existing].slice(0, MAX_ITEMS) });
      },
      clear: () => set({ items: [] }),
    }),
    { name: "sayurku-recently-viewed" }
  )
);
