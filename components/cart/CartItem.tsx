"use client";

import Link from "next/link";
import { QuantityStepper } from "@/components/product/QuantityStepper";
import { useCartStore, type CartItemView } from "@/store/useCartStore";
import { LeafIcon } from "@/components/icons/LeafIcon";

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    value
  );
}

export function CartItem({ item }: { item: CartItemView }) {
  const updateItem = useCartStore((s) => s.updateItem);
  const removeItem = useCartStore((s) => s.removeItem);

  return (
    <div className="flex items-center gap-4 py-4">
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

      <QuantityStepper value={item.quantity} onChange={(qty) => updateItem(item.productId, qty)} product={item} />

      <div className="w-28 text-right font-heading font-semibold text-stone-900">
        {formatRupiah(item.price * item.quantity)}
      </div>

      <button
        type="button"
        onClick={() => removeItem(item.productId)}
        aria-label="Hapus dari keranjang"
        className="text-stone-400 hover:text-red-600"
      >
        ✕
      </button>
    </div>
  );
}
