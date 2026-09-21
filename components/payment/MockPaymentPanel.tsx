"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LeafIcon } from "@/components/icons/LeafIcon";

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    value
  );
}

export function MockPaymentPanel({
  orderNumber,
  totalAmount,
  alreadyResolved,
  currentStatus,
}: {
  orderNumber: string;
  totalAmount: number;
  alreadyResolved: boolean;
  currentStatus: string;
}) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleOutcome(outcome: "success" | "failed") {
    setIsProcessing(true);
    await fetch(`/api/mock-payment/${orderNumber}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ outcome }),
    });
    router.push("/profil/riwayat");
    router.refresh();
  }

  if (alreadyResolved) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white p-6 text-center">
        <p className="text-stone-600">Pesanan ini sudah diproses sebelumnya (status pembayaran: {currentStatus}).</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-dashed border-stone-300 bg-white p-6">
      <div className="flex items-center gap-2 text-amber-700">
        <LeafIcon className="h-5 w-5" />
        <span className="text-xs font-semibold uppercase tracking-wide">Simulasi pembayaran (bukan gateway asli)</span>
      </div>

      <p className="mt-4 text-sm text-stone-500">No. Pesanan</p>
      <p className="font-heading font-semibold text-stone-900">{orderNumber}</p>

      <p className="mt-4 text-sm text-stone-500">Total Bayar</p>
      <span className="price-tag mt-1 inline-block bg-emerald-700 py-1.5 pr-4 text-lg font-bold text-white">
        {formatRupiah(totalAmount)}
      </span>

      <div className="mt-6 space-y-2">
        <button
          type="button"
          onClick={() => handleOutcome("success")}
          disabled={isProcessing}
          className="w-full rounded-md bg-emerald-700 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
        >
          {isProcessing ? "Memproses..." : "Simulasikan Pembayaran Berhasil"}
        </button>
        <button
          type="button"
          onClick={() => handleOutcome("failed")}
          disabled={isProcessing}
          className="w-full rounded-md border border-red-200 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          Simulasikan Pembayaran Gagal
        </button>
      </div>
    </div>
  );
}
