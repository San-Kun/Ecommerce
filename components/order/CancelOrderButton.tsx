"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  async function handleCancel() {
    setIsLoading(true);
    setError(null);

    const res = await fetch(`/api/orders/${orderId}`, { method: "PATCH" });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data.error ?? "Gagal membatalkan pesanan");
      setIsLoading(false);
      setConfirming(false);
      return;
    }

    router.refresh();
  }

  if (!confirming) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          Batalkan Pesanan
        </button>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="rounded-md border border-red-200 bg-red-50 p-3">
      <p className="text-sm text-red-700">Yakin ingin membatalkan pesanan ini?</p>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={handleCancel}
          disabled={isLoading}
          className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          {isLoading ? "Membatalkan..." : "Ya, batalkan"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={isLoading}
          className="rounded-md border border-stone-300 px-3 py-1.5 text-sm text-stone-600 hover:bg-white"
        >
          Tidak
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
