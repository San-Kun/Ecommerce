"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QuantityStepper } from "./QuantityStepper";
import { useCartStore } from "@/store/useCartStore";
import { toast } from "@/store/useToastStore";
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
  const [popKey, setPopKey] = useState(0);

  async function handleAddToCart() {
    setIsAdding(true);

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

    const currentError = useCartStore.getState().error;
    if (currentError) {
      toast.error(currentError);
    } else {
      setPopKey((k) => k + 1);
      toast.success("Berhasil ditambahkan ke keranjang");
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <QuantityStepper value={quantity} onChange={setQuantity} product={product} />
        <button
          key={popKey}
          type="button"
          onClick={handleAddToCart}
          disabled={isAdding || product.stock === 0}
          className={`rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-800 disabled:opacity-50 ${
            popKey > 0 ? "animate-pop" : ""
          }`}
        >
          {product.stock === 0 ? "Stok habis" : isAdding ? "Menambahkan..." : "Tambah ke keranjang"}
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
