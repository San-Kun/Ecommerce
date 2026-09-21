"use client"; // <-- TAMBAHKAN BARIS INI DI PALING ATAS FILE

import Link from "next/link";
import { WishlistButton } from "./WishlistButton";
import { LeafIcon } from "@/components/icons/LeafIcon";
import { ProductImage } from "./ProductImage";

type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  price: number;
  unit: string;
  image: string | null;
  isOrganic: boolean;
  stock: number;
};

const unitLabel: Record<string, string> = {
  GRAM: "gram",
  KG: "kg",
  IKAT: "ikat",
  PCS: "pcs",
};

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-stone-200 bg-white transition-shadow hover:shadow-md hover:shadow-emerald-900/5">
      <div className="absolute right-2 top-2 z-10">
        <WishlistButton productId={product.id} />
      </div>

      {product.isOrganic && (
        <span className="stamp-badge absolute left-2 top-2 z-10 bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 backdrop-blur-sm">
          organik
        </span>
      )}

      <Link href={`/produk/${product.slug}`}>
        <div className="leaf-pattern relative aspect-square overflow-hidden bg-emerald-50">
          {product.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <LeafIcon className="h-12 w-12 text-emerald-300" />
            </div>
          )}
          {/* Gradasi hijau tipis di bawah foto supaya nama produk tetap terbaca menyatu dengan warna sayur */}
          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-emerald-950/25 to-transparent" />
        </div>

        <div className="p-3">
          <h3 className="line-clamp-1 font-heading text-sm font-semibold text-stone-900">
            {product.name}
          </h3>

          <div className="mt-2 flex items-center justify-between">
            <span className="price-tag bg-emerald-700 py-1 pr-3 text-sm font-bold text-white">
              {formatRupiah(product.price)}
            </span>
            <span className="text-xs text-stone-500">
              / {unitLabel[product.unit] ?? product.unit.toLowerCase()}
            </span>
          </div>

          {product.stock === 0 && (
            <p className="mt-1.5 text-xs font-medium text-red-600">
              Stok habis
            </p>
          )}
        </div>
      </Link>
    </div>
  );
}