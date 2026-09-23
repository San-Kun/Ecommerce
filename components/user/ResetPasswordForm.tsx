"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setFormError(null);

    if (password !== confirm) {
      setErrors({ password: ["Konfirmasi password tidak cocok"] });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.error && typeof data.error === "object") {
          setErrors(data.error);
        } else {
          setFormError(data.error ?? "Gagal mengubah password");
        }
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/login"), 1500);
    } catch {
      setFormError("Terjadi kesalahan jaringan, coba lagi");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!token) {
    return (
      <p className="mt-8 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
        Token reset tidak ditemukan.{" "}
        <Link href="/forgot-password" className="font-medium underline">
          Minta tautan baru
        </Link>
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      {success && (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Password berhasil diubah. Mengarahkan ke halaman login...
        </p>
      )}
      {formError && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}

      <div>
        <label className="block text-sm font-medium text-stone-700">Password baru</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
        />
        {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password[0]}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700">Konfirmasi password</label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting || success}
        className="w-full rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
      >
        {isSubmitting ? "Menyimpan..." : "Ubah password"}
      </button>
    </form>
  );
}
