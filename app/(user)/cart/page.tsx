"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import { CartItem } from "@/components/cart/CartItem";

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    value
  );
}

export default function CartPage() {
  const { items, isLoading, error, fetchCart, subtotal } = useCartStore();

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading && items.length === 0) {
    return <div className="p-8 text-center text-stone-400">Memuat keranjang...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-stone-500">Keranjang kamu masih kosong.</p>
        <Link href="/" className="mt-3 inline-block text-emerald-700 hover:underline">
          Mulai belanja
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-xl font-semibold text-stone-900">Keranjang Belanja</h1>

      {error && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="mt-4 divide-y divide-stone-100 rounded-lg border border-stone-200 bg-white px-4">
        {items.map((item) => (
          <CartItem key={item.id} item={item} />
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-stone-200 pt-4">
        <span className="text-stone-500">Subtotal</span>
        <span className="text-lg font-semibold text-stone-900">{formatRupiah(subtotal())}</span>
      </div>

      <Link
        href="/checkout"
        className="mt-4 block w-full rounded-md bg-emerald-700 px-4 py-3 text-center text-sm font-medium text-white hover:bg-emerald-800"
      >
        Lanjut ke Checkout
      </Link>
    </div>
  );
}
