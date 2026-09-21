"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AddressFormValues = {
  label: string;
  fullAddress: string;
  latitude: number | null;
  longitude: number | null;
  isDefault: boolean;
};

export function AddressForm({
  mode,
  addressId,
  initialValues,
}: {
  mode: "create" | "edit";
  addressId?: string;
  initialValues?: Partial<AddressFormValues>;
}) {
  const router = useRouter();
  const [values, setValues] = useState<AddressFormValues>({
    label: initialValues?.label ?? "",
    fullAddress: initialValues?.fullAddress ?? "",
    latitude: initialValues?.latitude ?? null,
    longitude: initialValues?.longitude ?? null,
    isDefault: initialValues?.isDefault ?? false,
  });
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleUseCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationError("Browser kamu tidak mendukung deteksi lokasi");
      return;
    }
    setIsLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValues((prev) => ({ ...prev, latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
        setIsLocating(false);
      },
      () => {
        setLocationError(
          'Gagal mendapatkan lokasi. Izinkan akses lokasi di browser, atau isi koordinat manual di bawah.'
        );
        setIsLocating(false);
      }
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setSubmitError(null);

    if (values.latitude === null || values.longitude === null) {
      setSubmitError('Koordinat lokasi wajib diisi -- klik "Gunakan Lokasi Saat Ini" atau isi manual');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      label: values.label,
      fullAddress: values.fullAddress,
      latitude: values.latitude,
      longitude: values.longitude,
      isDefault: values.isDefault,
    };

    const url = mode === "create" ? "/api/addresses" : `/api/addresses/${addressId}`;
    const method = mode === "create" ? "POST" : "PUT";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.error && typeof data.error === "object") {
          setErrors(data.error);
        } else {
          setSubmitError(data.error ?? "Gagal menyimpan alamat");
        }
        return;
      }

      router.push("/profil/alamat");
      router.refresh();
    } catch {
      setSubmitError("Terjadi kesalahan jaringan, coba lagi");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 max-w-lg space-y-4">
      {submitError && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{submitError}</p>}

      <div>
        <label className="block text-sm font-medium text-stone-700">Label alamat</label>
        <input
          type="text"
          value={values.label}
          onChange={(e) => setValues((p) => ({ ...p, label: e.target.value }))}
          placeholder="mis. Rumah, Kantor"
          required
          className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
        />
        {errors.label && <p className="mt-1 text-xs text-red-600">{errors.label[0]}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700">Alamat lengkap</label>
        <textarea
          value={values.fullAddress}
          onChange={(e) => setValues((p) => ({ ...p, fullAddress: e.target.value }))}
          rows={3}
          required
          placeholder="Jl. Contoh No. 1, RT/RW, Kelurahan, Kecamatan, Kota, Kode Pos"
          className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
        />
        {errors.fullAddress && <p className="mt-1 text-xs text-red-600">{errors.fullAddress[0]}</p>}
      </div>

      <div className="rounded-md border border-dashed border-stone-300 p-3">
        <p className="text-sm font-medium text-stone-700">Titik lokasi (untuk hitung ongkir)</p>

        {values.latitude !== null && values.longitude !== null ? (
          <p className="mt-1 text-sm text-emerald-700">
            Lokasi tersimpan: {values.latitude.toFixed(5)}, {values.longitude.toFixed(5)}
          </p>
        ) : (
          <p className="mt-1 text-sm text-stone-400">Belum ada lokasi tersimpan</p>
        )}

        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          className="mt-2 rounded-md border border-emerald-600 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
        >
          {isLocating ? "Mendeteksi lokasi..." : "Gunakan Lokasi Saat Ini"}
        </button>
        {locationError && <p className="mt-2 text-xs text-red-600">{locationError}</p>}

        <details className="mt-2">
          <summary className="cursor-pointer text-xs text-stone-400">Atau isi koordinat manual</summary>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <input
              type="number"
              step="any"
              placeholder="Latitude"
              value={values.latitude ?? ""}
              onChange={(e) =>
                setValues((p) => ({ ...p, latitude: e.target.value ? Number(e.target.value) : null }))
              }
              className="rounded-md border border-stone-300 px-2 py-1.5 text-sm"
            />
            <input
              type="number"
              step="any"
              placeholder="Longitude"
              value={values.longitude ?? ""}
              onChange={(e) =>
                setValues((p) => ({ ...p, longitude: e.target.value ? Number(e.target.value) : null }))
              }
              className="rounded-md border border-stone-300 px-2 py-1.5 text-sm"
            />
          </div>
        </details>
      </div>

      <label className="flex items-center gap-2 text-sm text-stone-700">
        <input
          type="checkbox"
          checked={values.isDefault}
          onChange={(e) => setValues((p) => ({ ...p, isDefault: e.target.checked }))}
          className="rounded border-stone-300 text-emerald-700 focus:ring-emerald-600"
        />
        Jadikan alamat utama
      </label>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
        >
          {isSubmitting ? "Menyimpan..." : mode === "create" ? "Simpan alamat" : "Simpan perubahan"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/profil/alamat")}
          className="text-sm text-stone-500 hover:underline"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
