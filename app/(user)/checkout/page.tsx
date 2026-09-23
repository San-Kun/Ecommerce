"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";

type Address = { id: string; label: string; fullAddress: string; isDefault: boolean };

const SCHEDULE_OPTIONS = ["Pagi, 07.00 - 09.00", "Siang, 11.00 - 13.00", "Sore, 15.00 - 17.00"];

type PaymentMethod = "TRANSFER" | "COD";

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; description: string }[] = [
  { value: "TRANSFER", label: "Transfer Bank", description: "Transfer manual, dikonfirmasi admin setelah bukti diterima" },
  { value: "COD", label: "Bayar di Tempat (COD)", description: "Bayar tunai saat pesanan diantar" },
];

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    value
  );
}

export default function CheckoutPage() {
  const { items, fetchCart, subtotal } = useCartStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressId, setAddressId] = useState("");
  const [schedule, setSchedule] = useState(SCHEDULE_OPTIONS[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("TRANSFER");
  const [shipping, setShipping] = useState<{ cost: number; distanceKm: number } | null>(null);
  const [shippingError, setShippingError] = useState<string | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [voucherInput, setVoucherInput] = useState("");
  const [voucher, setVoucher] = useState<{ code: string; discount: number } | null>(null);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [isCheckingVoucher, setIsCheckingVoucher] = useState(false);

  useEffect(() => {
    fetchCart();
    fetch("/api/addresses")
      .then((r) => r.json())
      .then((data) => {
        const list: Address[] = data.items ?? [];
        setAddresses(list);
        const preferred = list.find((a) => a.isDefault) ?? list[0];
        if (preferred) setAddressId(preferred.id);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!addressId) return;
    let cancelled = false;

    async function estimate() {
      setIsEstimating(true);
      setShippingError(null);
      setShipping(null);
      try {
        const res = await fetch(`/api/shipping/estimate?addressId=${addressId}`);
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setShippingError(data.error ?? "Gagal menghitung ongkir");
          return;
        }
        setShipping({ cost: data.shippingCost, distanceKm: data.distanceKm });
      } finally {
        if (!cancelled) setIsEstimating(false);
      }
    }

    estimate();
    return () => {
      cancelled = true;
    };
  }, [addressId]);

  async function handleApplyVoucher() {
    const code = voucherInput.trim();
    if (!code) return;
    setIsCheckingVoucher(true);
    setVoucherError(null);
    try {
      const res = await fetch("/api/vouchers/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal: subtotal() }),
      });
      const data = await res.json();
      if (!data.valid) {
        setVoucher(null);
        setVoucherError(data.error ?? "Voucher tidak valid");
        return;
      }
      setVoucher({ code: data.code, discount: data.discount });
    } catch {
      setVoucherError("Gagal memeriksa voucher, coba lagi");
    } finally {
      setIsCheckingVoucher(false);
    }
  }

  function handleRemoveVoucher() {
    setVoucher(null);
    setVoucherInput("");
    setVoucherError(null);
  }

  async function handlePay() {
    if (!addressId || !shipping) return;
    setIsSubmitting(true);
    setSubmitError(null);

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        addressId,
        shippingSchedule: schedule,
        paymentMethod,
        voucherCode: voucher?.code,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setSubmitError(data.error ?? "Gagal membuat pesanan");
      setIsSubmitting(false);
      return;
    }

    window.location.href = data.redirectUrl;
  }

  if (items.length === 0) {
    return <div className="p-8 text-center text-stone-400">Keranjang kamu kosong.</div>;
  }

  const discount = voucher?.discount ?? 0;
  const total = subtotal() - discount + (shipping?.cost ?? 0);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-heading text-xl font-bold text-stone-900">Checkout</h1>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-stone-700">Alamat pengiriman</label>
          <Link href="/profil/alamat" className="text-xs text-emerald-700 hover:underline">
            Kelola alamat
          </Link>
        </div>
        {addresses.length === 0 ? (
          <p className="mt-1 text-sm text-amber-600">
            Kamu belum punya alamat tersimpan.{" "}
            <Link href="/profil/alamat/baru" className="underline">
              Tambah sekarang
            </Link>
          </p>
        ) : (
          <select
            value={addressId}
            onChange={(e) => setAddressId(e.target.value)}
            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            {addresses.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label} — {a.fullAddress}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-stone-700">Jadwal pengiriman</label>
        <select
          value={schedule}
          onChange={(e) => setSchedule(e.target.value)}
          className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
        >
          {SCHEDULE_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-stone-700">Metode pembayaran</label>
        <div className="mt-2 space-y-2">
          {PAYMENT_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 text-sm transition ${
                paymentMethod === opt.value
                  ? "border-emerald-600 bg-emerald-50"
                  : "border-stone-300 bg-white hover:border-stone-400"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={opt.value}
                checked={paymentMethod === opt.value}
                onChange={() => setPaymentMethod(opt.value)}
                className="mt-0.5 accent-emerald-600"
              />
              <span>
                <span className="block font-medium text-stone-900">{opt.label}</span>
                <span className="block text-xs text-stone-500">{opt.description}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-stone-700">Kode voucher</label>
        {voucher ? (
          <div className="mt-1 flex items-center justify-between rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm">
            <span className="font-medium text-emerald-800">
              {voucher.code} — hemat {formatRupiah(voucher.discount)}
            </span>
            <button type="button" onClick={handleRemoveVoucher} className="text-xs text-red-600 hover:underline">
              Hapus
            </button>
          </div>
        ) : (
          <div className="mt-1 flex gap-2">
            <input
              type="text"
              value={voucherInput}
              onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
              placeholder="Masukkan kode"
              className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm uppercase focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
            <button
              type="button"
              onClick={handleApplyVoucher}
              disabled={isCheckingVoucher || !voucherInput.trim()}
              className="shrink-0 rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
            >
              {isCheckingVoucher ? "Cek..." : "Pakai"}
            </button>
          </div>
        )}
        {voucherError && <p className="mt-1 text-sm text-red-600">{voucherError}</p>}
      </div>

      <div className="mt-6 space-y-2 rounded-xl border border-dashed border-stone-300 bg-white p-4">
        <div className="flex justify-between text-sm">
          <span className="text-stone-500">Subtotal</span>
          <span className="text-stone-900">{formatRupiah(subtotal())}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-stone-500">Diskon ({voucher?.code})</span>
            <span className="text-emerald-700">-{formatRupiah(discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-stone-500">Ongkos kirim {shipping ? `(${shipping.distanceKm} km)` : ""}</span>
          <span className="text-stone-900">
            {isEstimating ? "Menghitung..." : shipping ? formatRupiah(shipping.cost) : "-"}
          </span>
        </div>
        {shippingError && <p className="text-sm text-red-600">{shippingError}</p>}
        <div className="flex items-center justify-between border-t border-dashed border-stone-300 pt-2 font-semibold text-stone-900">
          <span>Total</span>
          <span className="price-tag bg-emerald-700 py-1.5 pr-4 text-white">{formatRupiah(total)}</span>
        </div>
      </div>

      {submitError && <p className="mt-3 text-sm text-red-600">{submitError}</p>}

      <button
        type="button"
        onClick={handlePay}
        disabled={isSubmitting || !shipping || addresses.length === 0}
        className="mt-4 w-full rounded-md bg-emerald-700 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
      >
        {isSubmitting
          ? "Memproses..."
          : paymentMethod === "COD"
            ? "Buat Pesanan (Bayar di Tempat)"
            : "Buat Pesanan & Lihat Instruksi Transfer"}
      </button>
    </div>
  );
}
