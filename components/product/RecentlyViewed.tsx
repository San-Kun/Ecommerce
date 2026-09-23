"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRecentlyViewedStore, type RecentProduct } from "@/store/useRecentlyViewedStore";
import { LeafIcon } from "@/components/icons/LeafIcon";

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    value
  );
}

/** Catat produk yang sedang dilihat ke store (dipasang di halaman detail produk). */
export function RecordRecentlyViewed({ product }: { product: RecentProduct }) {
  const add = useRecentlyViewedStore((s) => s.add);
  useEffect(() => {
    add(product);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);
  return null;
}

/** Rak "Baru dilihat". Bisa mengecualikan satu produk (mis. yang sedang dibuka). */
export function RecentlyViewedShelf({ excludeId, title = "Baru dilihat" }: { excludeId?: string; title?: string }) {
  const items = useRecentlyViewedStore((s) => s.items).filter((p) => p.id !== excludeId);

  if (items.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="font-heading text-lg font-semibold text-stone-900">{title}</h2>
      <div className="-mx-4 mt-4 flex gap-3 overflow-x-auto px-4 pb-2">
        {items.map((p) => (
          <Link
            key={p.id}
            href={`/produk/${p.slug}`}
            className="w-32 shrink-0 overflow-hidden rounded-xl border border-stone-200 bg-white transition-shadow hover:shadow-md hover:shadow-emerald-900/5"
          >
            <div className="leaf-pattern flex aspect-square items-center justify-center overflow-hidden bg-emerald-50">
              {p.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.image}
                  alt={p.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <LeafIcon className="h-8 w-8 text-emerald-300" />
              )}
            </div>
            <div className="p-2">
              <p className="line-clamp-1 text-xs font-medium text-stone-900">{p.name}</p>
              <p className="mt-0.5 text-xs text-emerald-700">{formatRupiah(p.price)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
