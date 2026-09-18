// Titik asal gudang/toko SayurKu -- ganti sesuai lokasi asli kalau sudah ada.
const STORE_ORIGIN = { latitude: -6.2297, longitude: 106.8261 }; // contoh: Jakarta Selatan

const MAX_DELIVERY_KM = 15;

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Jarak garis lurus antara dua koordinat dalam kilometer (formula Haversine).
 * Ini estimasi kasar (bukan jarak jalan sesungguhnya), cukup untuk skala
 * pengantaran dalam kota seperti target SayurKu.
 */
export function haversineDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // radius bumi dalam km
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/** Tarif ongkir bertingkat berdasarkan jarak dari gudang. */
export function calculateShippingCost(distanceKm: number): number {
  if (distanceKm <= 3) return 8000;
  if (distanceKm <= 6) return 12000;
  if (distanceKm <= 10) return 16000;
  const extraKm = Math.ceil(distanceKm - 10);
  return 16000 + extraKm * 2000;
}

export type ShippingEstimate =
  | { ok: true; distanceKm: number; cost: number }
  | { ok: false; reason: string };

/** Estimasi ongkir ke suatu koordinat tujuan, atau alasan kalau di luar jangkauan. */
export function estimateShipping(destination: { latitude: number; longitude: number }): ShippingEstimate {
  const distanceKm = haversineDistanceKm(
    STORE_ORIGIN.latitude,
    STORE_ORIGIN.longitude,
    destination.latitude,
    destination.longitude
  );

  if (distanceKm > MAX_DELIVERY_KM) {
    return { ok: false, reason: `Lokasi di luar jangkauan pengiriman (maksimal ${MAX_DELIVERY_KM} km dari gudang)` };
  }

  return { ok: true, distanceKm: Math.round(distanceKm * 10) / 10, cost: calculateShippingCost(distanceKm) };
}
