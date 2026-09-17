"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function RegisterForm() {
  const router = useRouter();
  const [values, setValues] = useState({ name: "", email: "", phone: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update(key: keyof typeof values, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setFormError(null);
    setIsSubmitting(true);

    try {
      const registerRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          phone: values.phone || undefined,
          password: values.password,
        }),
      });
      const registerData = await registerRes.json();

      if (!registerRes.ok) {
        if (registerData.error && typeof registerData.error === "object") {
          setErrors(registerData.error);
        } else {
          setFormError(registerData.error ?? "Gagal mendaftar, coba lagi");
        }
        return;
      }

      // Auto-login setelah daftar berhasil, biar user langsung bisa belanja
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email, password: values.password }),
      });

      if (!loginRes.ok) {
        // Registrasi tetap berhasil, cuma auto-login gagal -> arahkan ke halaman login manual
        router.push("/login");
        return;
      }

      router.push("/");
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
        <label className="block text-sm font-medium text-stone-700">Email</label>
        <input
          type="email"
          value={values.email}
          onChange={(e) => update("email", e.target.value)}
          required
          className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
        />
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email[0]}</p>}
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

      <div>
        <label className="block text-sm font-medium text-stone-700">Password</label>
        <input
          type="password"
          value={values.password}
          onChange={(e) => update("password", e.target.value)}
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
        {isSubmitting ? "Memproses..." : "Daftar"}
      </button>

      <p className="text-center text-sm text-stone-500">
        Sudah punya akun?{" "}
        <Link href="/login" className="text-emerald-700 hover:underline">
          Masuk
        </Link>
      </p>
    </form>
  );
}
