import type { Voucher } from "@prisma/client";

export type VoucherCheck =
  | { ok: true; discount: number; voucher: Voucher }
  | { ok: false; reason: string };

/**
 * Validasi voucher terhadap subtotal & hitung potongannya. Dipakai baik di
 * endpoint validate (preview) maupun saat order dibuat (sumber kebenaran).
 * Potongan tidak boleh melebihi subtotal.
 */
export function evaluateVoucher(voucher: Voucher | null, subtotal: number): VoucherCheck {
  if (!voucher) return { ok: false, reason: "Kode voucher tidak ditemukan" };
  if (!voucher.isActive) return { ok: false, reason: "Voucher tidak aktif" };

  if (voucher.expiresAt && voucher.expiresAt.getTime() < Date.now()) {
    return { ok: false, reason: "Voucher sudah kadaluarsa" };
  }

  if (voucher.usageLimit != null && voucher.usedCount >= voucher.usageLimit) {
    return { ok: false, reason: "Kuota voucher sudah habis" };
  }

  const minSpend = Number(voucher.minSpend);
  if (subtotal < minSpend) {
    return { ok: false, reason: `Minimal belanja Rp${minSpend.toLocaleString("id-ID")} untuk memakai voucher ini` };
  }

  const value = Number(voucher.value);
  let discount: number;
  if (voucher.type === "PERCENT") {
    discount = Math.round((subtotal * value) / 100);
    const maxDiscount = voucher.maxDiscount != null ? Number(voucher.maxDiscount) : null;
    if (maxDiscount != null && discount > maxDiscount) discount = maxDiscount;
  } else {
    discount = Math.round(value);
  }

  // Potongan tidak boleh melebihi subtotal.
  if (discount > subtotal) discount = subtotal;

  return { ok: true, discount, voucher };
}
