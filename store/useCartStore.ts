import { create } from "zustand";

export type CartItemView = {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  price: number;
  unit: string;
  image: string | null;
  stock: number;
  stepQuantity: number;
  minOrderQty: number;
  quantity: number;
};

type CartState = {
  items: CartItemView[];
  isLoading: boolean;
  error: string | null;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity: number) => Promise<void>;
  updateItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  totalItems: () => number;
  subtotal: () => number;
};

/**
 * Cart di sini cuma cache lokal untuk UI biar responsif (optimistic update).
 * Sumber kebenarannya tetap tabel `carts`/`cart_items` di database -- store
 * ini bukan pengganti itu, cuma sinkronisasi dua arah lewat fetch/mutate API.
 */
export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/cart");
      if (!res.ok) throw new Error("Gagal memuat keranjang");
      const data = await res.json();
      set({ items: data.items, isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Terjadi kesalahan", isLoading: false });
    }
  },

  addItem: async (productId, quantity) => {
    set({ error: null });
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity }),
    });
    const data = await res.json();
    if (!res.ok) {
      set({ error: data.error ?? "Gagal menambah ke keranjang" });
      return;
    }
    set({ items: data.items });
  },

  updateItem: async (productId, quantity) => {
    set({ error: null });
    const prevItems = get().items;
    // Optimistic update dulu, baru koreksi kalau ternyata gagal di server
    set({ items: prevItems.map((i) => (i.productId === productId ? { ...i, quantity } : i)) });

    const res = await fetch(`/api/cart/${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });

    if (!res.ok) {
      const data = await res.json();
      set({ items: prevItems, error: data.error ?? "Gagal mengubah kuantitas" });
    }
  },

  removeItem: async (productId) => {
    set({ error: null });
    const prevItems = get().items;
    set({ items: prevItems.filter((i) => i.productId !== productId) });

    const res = await fetch(`/api/cart/${productId}`, { method: "DELETE" });
    if (!res.ok) {
      set({ items: prevItems, error: "Gagal menghapus item" });
    }
  },

  totalItems: () => get().items.length,
  subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
}));
