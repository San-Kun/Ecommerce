"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setFormError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.error && typeof data.error === "object") {
          setErrors(data.error);
        } else {
          setFormError(data.error ?? "Gagal masuk, coba lagi");
        }
        return;
      }

      router.push(redirectTo || (data.role === "ADMIN" ? "/admin" : "/"));
      router.refresh();
    } catch {
      setFormError("Terjadi kesalahan jaringan, coba lagi");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      {formError && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}

      <div>
        <label className="block text-sm font-medium text-stone-700">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
        />
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email[0]}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
        />
        {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password[0]}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
      >
        {isSubmitting ? "Memproses..." : "Masuk"}
      </button>

      <p className="text-center text-sm text-stone-500">
        Belum punya akun?{" "}
        <Link href="/register" className="text-emerald-700 hover:underline">
          Daftar
        </Link>
      </p>
    </form>
  );
}
