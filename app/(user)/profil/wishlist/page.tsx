"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useWishlistStore } from "@/store/useWishlistStore";

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    value
  );
}

export default function WishlistPage() {
  const { items, isLoading, fetchWishlist, toggleWishlist } = useWishlistStore();

  useEffect(() => {
    fetchWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading && items.length === 0) {
    return <div className="p-8 text-center text-stone-400">Memuat wishlist...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-stone-500">Belum ada produk di wishlist kamu.</p>
        <Link href="/" className="mt-3 inline-block text-emerald-700 hover:underline">
          Jelajahi produk
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-xl font-semibold text-stone-900">Wishlist</h1>

      <div className="mt-4 divide-y divide-stone-100 rounded-lg border border-stone-200 bg-white px-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 py-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-stone-100">
              {item.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image} alt={item.productName} className="h-full w-full object-cover" />
              )}
            </div>
            <div className="flex-1">
              <Link href={`/produk/${item.productSlug}`} className="font-medium text-stone-900 hover:underline">
                {item.productName}
              </Link>
              <p className="text-sm text-stone-500">
                {formatRupiah(item.price)} / {item.unit.toLowerCase()}
              </p>
            </div>
            <button
              type="button"
              onClick={() => toggleWishlist(item.productId)}
              className="text-sm text-red-600 hover:underline"
            >
              Hapus
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
