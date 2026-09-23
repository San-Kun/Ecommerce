"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LeafIcon } from "@/components/icons/LeafIcon";

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    value
  );
}

type BankInfo = { bankName: string; accountNumber: string; accountHolder: string };

const PAYMENT_STATUS_LABEL: Record<string, string> = {
  MENUNGGU: "Menunggu pembayaran",
  BERHASIL: "Pembayaran diterima",
  GAGAL: "Pembayaran gagal / dibatalkan",
};

export function TransferInstructionPanel({
  orderNumber,
  totalAmount,
  paymentStatus,
  bank,
}: {
  orderNumber: string;
  totalAmount: number;
  paymentStatus: string;
  bank: BankInfo;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // clipboard bisa gagal di konteks non-secure; abaikan saja
    }
  }

  const isPaid = paymentStatus === "BERHASIL";
  const isFailed = paymentStatus === "GAGAL";

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-6">
      <div className="flex items-center gap-2 text-emerald-700">
        <LeafIcon className="h-5 w-5" />
        <span className="text-xs font-semibold uppercase tracking-wide">Instruksi Transfer Bank</span>
      </div>

      <p className="mt-4 text-sm text-stone-500">No. Pesanan</p>
      <p className="font-heading font-semibold text-stone-900">{orderNumber}</p>

      <p className="mt-4 text-sm text-stone-500">Total yang harus ditransfer</p>
      <div className="mt-1 flex items-center gap-2">
        <span className="price-tag inline-block bg-emerald-700 py-1.5 pr-4 text-lg font-bold text-white">
          {formatRupiah(totalAmount)}
        </span>
        <button
          type="button"
          onClick={() => copy(String(totalAmount), "amount")}
          className="text-xs text-emerald-700 hover:underline"
        >
          {copied === "amount" ? "Tersalin" : "Salin nominal"}
        </button>
      </div>

      <div className="mt-6 space-y-1 rounded-md border border-dashed border-stone-300 bg-stone-50 p-4 text-sm">
        <div className="flex justify-between">
          <span className="text-stone-500">Bank</span>
          <span className="font-medium text-stone-900">{bank.bankName}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-stone-500">No. Rekening</span>
          <span className="flex items-center gap-2 font-medium text-stone-900">
            {bank.accountNumber}
            <button
              type="button"
              onClick={() => copy(bank.accountNumber, "acc")}
              className="text-xs text-emerald-700 hover:underline"
            >
              {copied === "acc" ? "Tersalin" : "Salin"}
            </button>
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone-500">Atas nama</span>
          <span className="font-medium text-stone-900">{bank.accountHolder}</span>
        </div>
      </div>

      <div
        className={`mt-4 rounded-md px-3 py-2 text-sm ${
          isPaid
            ? "bg-emerald-50 text-emerald-700"
            : isFailed
              ? "bg-red-50 text-red-600"
              : "bg-amber-50 text-amber-700"
        }`}
      >
        Status: {PAYMENT_STATUS_LABEL[paymentStatus] ?? paymentStatus}
      </div>

      {!isPaid && !isFailed && (
        <p className="mt-4 text-xs text-stone-500">
          Setelah melakukan transfer, pesanan akan diproses begitu pembayaran dikonfirmasi oleh admin. Cantumkan nomor
          pesanan di berita transfer agar mudah dicocokkan.
        </p>
      )}

      <button
        type="button"
        onClick={() => {
          router.push("/profil/riwayat");
          router.refresh();
        }}
        className="mt-6 w-full rounded-md border border-stone-300 px-4 py-3 text-sm font-medium text-stone-700 hover:bg-stone-50"
      >
        Lihat Riwayat Pesanan
      </button>
    </div>
  );
}
