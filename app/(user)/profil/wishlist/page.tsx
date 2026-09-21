"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useWishlistStore } from "@/store/useWishlistStore";
import { LeafIcon } from "@/components/icons/LeafIcon";

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
      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-20 text-center">
        <LeafIcon className="h-12 w-12 text-emerald-200" />
        <p className="mt-4 text-stone-500">Belum ada produk di wishlist kamu.</p>
        <Link href="/" className="mt-3 font-medium text-emerald-700 hover:underline">
          Jelajahi produk
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-heading text-xl font-bold text-stone-900">Wishlist</h1>

      <div className="mt-4 divide-y divide-dashed divide-stone-200 rounded-xl border border-stone-200 bg-white px-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 py-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-emerald-50">
              {item.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.image}
                  alt={item.productName}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <LeafIcon className="h-6 w-6 text-emerald-300" />
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
