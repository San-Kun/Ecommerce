"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import { CartItem } from "@/components/cart/CartItem";
import { EmptyState } from "@/components/common/EmptyState";
import { CartIcon } from "@/components/icons/nav";
import { Skeleton } from "@/components/common/Skeleton";

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
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Skeleton className="h-6 w-48" />
        <div className="mt-4 space-y-3 rounded-xl border border-stone-200 bg-white p-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-16 w-16" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<CartIcon className="h-11 w-11 text-emerald-300" />}
        title="Keranjang kamu masih kosong"
        description="Yuk isi dengan sayur segar pilihan kamu."
        actionHref="/produk"
        actionLabel="Mulai belanja"
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-heading text-xl font-bold text-stone-900">Keranjang Belanja</h1>

      {error && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="mt-4 divide-y divide-dashed divide-stone-200 rounded-xl border border-stone-200 bg-white px-4">
        {items.map((item) => (
          <CartItem key={item.id} item={item} />
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-dashed border-stone-300 pt-4">
        <span className="text-stone-500">Subtotal</span>
        <span className="price-tag bg-emerald-700 py-1.5 pr-4 text-lg font-bold text-white">
          {formatRupiah(subtotal())}
        </span>
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
