"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ProfileFormProps = {
  initialName: string;
  initialPhone: string;
};

export function ProfileForm({ initialName, initialPhone }: ProfileFormProps) {
  const router = useRouter();
  const [values, setValues] = useState({
    name: initialName,
    phone: initialPhone,
    currentPassword: "",
    newPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update(key: keyof typeof values, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setFormError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          phone: values.phone,
          currentPassword: values.currentPassword || undefined,
          newPassword: values.newPassword || undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.error && typeof data.error === "object") {
          setErrors(data.error);
        } else {
          setFormError(data.error ?? "Gagal menyimpan perubahan");
        }
        return;
      }

      setSuccess(true);
      setValues((prev) => ({ ...prev, currentPassword: "", newPassword: "" }));
      router.refresh();
    } catch {
      setFormError("Terjadi kesalahan jaringan, coba lagi");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formError && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}
      {success && (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">Profil berhasil diperbarui.</p>
      )}

      <div>
        <label className="block text-sm font-medium text-stone-700">Nama lengkap</label>
        <input
          type="text"
          value={values.name}
          onChange={(e) => update("name", e.target.value)}
          required
          className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
        />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name[0]}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700">
          No. HP <span className="font-normal text-stone-400">(opsional)</span>
        </label>
        <input
          type="tel"
          value={values.phone}
          onChange={(e) => update("phone", e.target.value)}
          placeholder="08123456789"
          className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
        />
        {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone[0]}</p>}
      </div>

      <div className="border-t border-dashed border-stone-200 pt-4">
        <p className="text-sm font-medium text-stone-700">Ganti password</p>
        <p className="text-xs text-stone-400">Kosongkan jika tidak ingin mengubah password.</p>

        <div className="mt-3 space-y-3">
          <div>
            <label className="block text-sm font-medium text-stone-700">Password lama</label>
            <input
              type="password"
              value={values.currentPassword}
              onChange={(e) => update("currentPassword", e.target.value)}
              className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
            {errors.currentPassword && <p className="mt-1 text-xs text-red-600">{errors.currentPassword[0]}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700">Password baru</label>
            <input
              type="password"
              value={values.newPassword}
              onChange={(e) => update("newPassword", e.target.value)}
              className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
            {errors.newPassword && <p className="mt-1 text-xs text-red-600">{errors.newPassword[0]}</p>}
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
      >
        {isSubmitting ? "Menyimpan..." : "Simpan perubahan"}
      </button>
    </form>
  );
}
