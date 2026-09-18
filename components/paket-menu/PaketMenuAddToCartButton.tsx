"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";

export function PaketMenuAddToCartButton({ slug }: { slug: string }) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [result, setResult] = useState<{ addedCount: number; skipped: { productName: string; reason: string }[] } | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const setCartItems = useCartStore((s) => s.fetchCart);

  async function handleAddAll() {
    setIsAdding(true);
    setError(null);
    setResult(null);

    const res = await fetch(`/api/paket-menu/${slug}/add-to-cart`, { method: "POST" });

    if (res.status === 401) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      setIsAdding(false);
      return;
    }

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Gagal menambahkan paket ke keranjang");
      setIsAdding(false);
      return;
    }

    setResult({ addedCount: data.addedCount, skipped: data.skipped });
    await setCartItems(); // sinkronkan cache Zustand cart dengan kondisi server terbaru
    setIsAdding(false);
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleAddAll}
        disabled={isAdding}
        className="w-full rounded-md bg-emerald-700 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50 sm:w-auto"
      >
        {isAdding ? "Menambahkan..." : "Tambah semua ke keranjang"}
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {result && (
        <div className="text-sm">
          <p className="text-emerald-700">{result.addedCount} bahan berhasil ditambahkan ke keranjang.</p>
          {result.skipped.length > 0 && (
            <ul className="mt-1 list-inside list-disc text-amber-600">
              {result.skipped.map((s) => (
                <li key={s.productName}>
                  {s.productName}: {s.reason}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
