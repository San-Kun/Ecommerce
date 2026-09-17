type NumericLike = number | string | { toString(): string };

function toNumber(value: NumericLike): number {
  return typeof value === "number" ? value : Number(value.toString());
}

const UNIT_LABEL: Record<string, string> = {
  GRAM: "gram",
  KG: "kg",
  IKAT: "ikat",
  PCS: "pcs",
};

/** Label satuan dalam Bahasa Indonesia, sesuai enum ProductUnit di Prisma. */
export function formatUnit(unit: string): string {
  return UNIT_LABEL[unit] ?? unit.toLowerCase();
}

/**
 * Kelipatan kuantitas yang boleh dibeli untuk suatu produk.
 * Contoh: cabai stepQuantity = 0.1 (kg) -> tiap klik +/- nambah/kurang 0.1 kg.
 *         kangkung stepQuantity = 1 (ikat) -> tiap klik nambah/kurang 1 ikat utuh.
 *
 * Menerima number (dari client, setelah data diserialisasi API) ATAU
 * Prisma.Decimal (dari server, hasil query langsung) -- keduanya kompatibel
 * karena tinggal dikonversi lewat toNumber().
 */
export function getQuantityStep(product: { stepQuantity: NumericLike }): number {
  const step = toNumber(product.stepQuantity);
  return step > 0 ? step : 1; // fallback aman kalau data korup atau 0
}

/** Kuantitas minimum yang boleh dibeli untuk produk ini. */
export function getMinOrderQuantity(product: { minOrderQty: NumericLike }): number {
  const min = toNumber(product.minOrderQty);
  return min > 0 ? min : 1;
}

/** Cari jumlah desimal yang wajar berdasarkan step (mis. step 0.25 -> 2 desimal, step 1 -> 0 desimal). */
function decimalPlacesFromStep(step: number): number {
  const str = step.toString();
  const dotIndex = str.indexOf(".");
  return dotIndex === -1 ? 0 : str.length - dotIndex - 1;
}

/**
 * Bulatkan angka ke kelipatan step terdekat, sekaligus hindari floating point
 * error khas JavaScript (mis. 0.1 + 0.2 = 0.30000000000000004).
 */
export function roundToStep(value: number, step: number): number {
  const decimals = Math.max(decimalPlacesFromStep(step), 0);
  const factor = 10 ** decimals;
  const roundedToStep = Math.round(value / step) * step;
  return Math.round(roundedToStep * factor) / factor;
}

/**
 * Format angka kuantitas + label satuan untuk ditampilkan ke user.
 * Contoh: formatQuantity(0.25, "KG")  -> "0.25 kg"
 *         formatQuantity(2, "IKAT")   -> "2 ikat"
 */
export function formatQuantity(quantity: number, unit: string): string {
  const decimals = quantity % 1 === 0 ? 0 : Math.min(String(quantity).split(".")[1]?.length ?? 0, 2);
  return `${quantity.toFixed(decimals)} ${formatUnit(unit)}`;
}

type StepperProduct = {
  stepQuantity: NumericLike;
  minOrderQty: NumericLike;
  stock: number;
  unit: string;
};

/**
 * Kuantitas berikutnya kalau user klik tombol "+" pada stepper.
 * Di-clamp supaya tidak melebihi stok yang tersedia.
 */
export function incrementQuantity(currentQty: number, product: StepperProduct): number {
  const step = getQuantityStep(product);
  const next = roundToStep(currentQty + step, step);
  return Math.min(next, product.stock);
}

/**
 * Kuantitas berikutnya kalau user klik tombol "-" pada stepper.
 * Tidak boleh turun di bawah kuantitas minimum pembelian.
 * (Kalau mau kuantitas bisa turun sampai 0 untuk hapus dari cart, itu aksi
 * terpisah -- tombol "hapus" -- bukan hasil dari step turun sampai nol.)
 */
export function decrementQuantity(currentQty: number, product: StepperProduct): number {
  const step = getQuantityStep(product);
  const min = getMinOrderQuantity(product);
  const next = roundToStep(currentQty - step, step);
  return Math.max(next, min);
}

/**
 * Validasi kuantitas yang diketik manual oleh user (bukan lewat tombol +/-),
 * misalnya kalau nanti ada input angka manual di halaman cart.
 */
export function validateQuantity(
  quantity: number,
  product: StepperProduct
): { valid: boolean; message?: string } {
  const step = getQuantityStep(product);
  const min = getMinOrderQuantity(product);

  if (quantity < min) {
    return { valid: false, message: `Minimal pembelian ${formatQuantity(min, product.unit)}` };
  }

  if (quantity > product.stock) {
    return { valid: false, message: `Stok tersisa ${formatQuantity(product.stock, product.unit)}` };
  }

  // Kuantitas harus kelipatan step dari titik minimum, dengan toleransi kecil
  // untuk floating point (mis. 0.30000000000000004 harus tetap dianggap valid).
  const stepsFromMin = (quantity - min) / step;
  const isValidStep = Math.abs(stepsFromMin - Math.round(stepsFromMin)) < 1e-6;

  if (!isValidStep) {
    return { valid: false, message: `Kuantitas harus kelipatan ${formatQuantity(step, product.unit)}` };
  }

  return { valid: true };
}
