import { create } from "zustand";

export type WishlistItemView = {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  price: number;
  unit: string;
  image: string | null;
};

type WishlistState = {
  items: WishlistItemView[];
  isLoading: boolean;
  fetchWishlist: () => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  isWishlisted: (productId: string) => boolean;
};

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  isLoading: false,

  fetchWishlist: async () => {
    set({ isLoading: true });
    const res = await fetch("/api/wishlist");
    if (res.ok) {
      const data = await res.json();
      set({ items: data.items, isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },

  isWishlisted: (productId) => get().items.some((i) => i.productId === productId),

  toggleWishlist: async (productId) => {
    const alreadyWishlisted = get().isWishlisted(productId);
    const prevItems = get().items;

    if (alreadyWishlisted) {
      set({ items: prevItems.filter((i) => i.productId !== productId) });
      const res = await fetch(`/api/wishlist/${productId}`, { method: "DELETE" });
      if (!res.ok) set({ items: prevItems }); // rollback kalau gagal
      return;
    }

    const res = await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    if (res.ok) {
      const data = await res.json();
      set({ items: data.items });
    }
  },
}));
