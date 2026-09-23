"use client";

import { useState } from "react";
import Link from "next/link";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setDevResetUrl(null);
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Gagal memproses permintaan");
        return;
      }

      setMessage(data.message ?? "Jika email terdaftar, tautan reset password telah dibuat.");
      if (data.devResetUrl) setDevResetUrl(data.devResetUrl);
    } catch {
      setError("Terjadi kesalahan jaringan, coba lagi");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      {message && <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}
      {devResetUrl && (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
          Mode pengembangan — tautan reset:{" "}
          <Link href={devResetUrl} className="font-medium underline">
            buka halaman reset
          </Link>
        </p>
      )}
      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div>
        <label className="block text-sm font-medium text-stone-700">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
      >
        {isSubmitting ? "Memproses..." : "Kirim tautan reset"}
      </button>

      <p className="text-center text-sm text-stone-500">
        Ingat password?{" "}
        <Link href="/login" className="text-emerald-700 hover:underline">
          Masuk
        </Link>
      </p>
    </form>
  );
}
