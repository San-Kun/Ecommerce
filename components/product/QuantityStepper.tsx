"use client";

import { incrementQuantity, decrementQuantity, formatQuantity, getMinOrderQuantity } from "@/lib/unit-helper";

type StepperProduct = {
  stepQuantity: number;
  minOrderQty: number;
  stock: number;
  unit: string;
};

export function QuantityStepper({
  value,
  onChange,
  product,
}: {
  value: number;
  onChange: (value: number) => void;
  product: StepperProduct;
}) {
  const min = getMinOrderQuantity(product);

  return (
    <div className="inline-flex items-center rounded-md border border-stone-300">
      <button
        type="button"
        onClick={() => onChange(decrementQuantity(value, product))}
        disabled={value <= min}
        aria-label="Kurangi kuantitas"
        className="px-3 py-1.5 text-stone-600 hover:bg-stone-50 disabled:opacity-30"
      >
        −
      </button>
      <span className="min-w-[76px] px-2 text-center text-sm font-medium text-stone-900">
        {formatQuantity(value, product.unit)}
      </span>
      <button
        type="button"
        onClick={() => onChange(incrementQuantity(value, product))}
        disabled={value >= product.stock}
        aria-label="Tambah kuantitas"
        className="px-3 py-1.5 text-stone-600 hover:bg-stone-50 disabled:opacity-30"
      >
        +
      </button>
    </div>
  );
}
