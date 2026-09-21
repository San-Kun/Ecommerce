"use client"; // <-- Tambahkan baris ini di paling atas

import Link from "next/link";
import { LeafIcon } from "@/components/icons/LeafIcon";

type PaketMenuCardData = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  image: string | null;
  itemCount: number;
};

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function PaketMenuCard({ paketMenu }: { paketMenu: PaketMenuCardData }) {
  return (
    <Link
      href={`/paket-menu/${paketMenu.slug}`}
      className="block overflow-hidden rounded-xl border border-stone-200 bg-white transition-shadow hover:shadow-md hover:shadow-emerald-900/5"
    >
      <div className="leaf-pattern flex aspect-video items-center justify-center overflow-hidden bg-emerald-50">
        {paketMenu.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={paketMenu.image}
            alt={paketMenu.name}
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <LeafIcon className="h-10 w-10 text-emerald-300" />
        )}
      </div>
      <div className="p-4">
        <h3 className="font-heading font-semibold text-stone-900">
          {paketMenu.name}
        </h3>
        {paketMenu.description && (
          <p className="mt-1 line-clamp-2 text-sm text-stone-500">
            {paketMenu.description}
          </p>
        )}
        <div className="mt-3 flex items-center justify-between">
          <span className="price-tag bg-emerald-700 py-1 pr-3 text-sm font-bold text-white">
            {formatRupiah(paketMenu.price)}
          </span>
          <span className="text-xs text-stone-400">
            {paketMenu.itemCount} bahan
          </span>
        </div>
      </div>
    </Link>
  );
}