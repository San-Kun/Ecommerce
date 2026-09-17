"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QuantityStepper } from "./QuantityStepper";
import { useCartStore } from "@/store/useCartStore";
import { getMinOrderQuantity } from "@/lib/unit-helper";

type AddToCartProduct = {
  id: string;
  stepQuantity: number;
  minOrderQty: number;
  stock: number;
  unit: string;
};

export function AddToCartButton({ product }: { product: AddToCartProduct }) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const error = useCartStore((s) => s.error);
  const [quantity, setQuantity] = useState(getMinOrderQuantity(product));
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  async function handleAddToCart() {
    setIsAdding(true);
    setJustAdded(false);

    // requireAuth di endpoint /api/cart bakal balikin 401 kalau belum login;
    // di sini kita cek dulu lewat status code respons, bukan asumsi.
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id, quantity }),
    });

    if (res.status === 401) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      setIsAdding(false);
      return;
    }

    await addItem(product.id, quantity);
    setIsAdding(false);

    if (!useCartStore.getState().error) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <QuantityStepper value={quantity} onChange={setQuantity} product={product} />
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isAdding || product.stock === 0}
          className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
        >
          {product.stock === 0 ? "Stok habis" : isAdding ? "Menambahkan..." : "Tambah ke keranjang"}
        </button>
      </div>
      {justAdded && <p className="text-sm text-emerald-700">Berhasil ditambahkan ke keranjang.</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
