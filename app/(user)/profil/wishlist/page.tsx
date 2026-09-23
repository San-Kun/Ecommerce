"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useWishlistStore } from "@/store/useWishlistStore";
import { LeafIcon } from "@/components/icons/LeafIcon";
import { EmptyState } from "@/components/common/EmptyState";
import { HeartIcon } from "@/components/icons/nav";
import { Skeleton } from "@/components/common/Skeleton";

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
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Skeleton className="h-6 w-40" />
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
        icon={<HeartIcon className="h-11 w-11 text-emerald-300" />}
        title="Wishlist kamu masih kosong"
        description="Tandai produk favoritmu dengan ikon hati agar mudah ditemukan lagi."
        actionHref="/produk"
        actionLabel="Jelajahi produk"
      />
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
