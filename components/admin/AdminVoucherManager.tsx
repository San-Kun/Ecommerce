"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type VoucherRow = {
  id: string;
  code: string;
  description: string | null;
  type: "PERCENT" | "FIXED";
  value: number;
  minSpend: number;
  maxDiscount: number | null;
  isActive: boolean;
  expiresAt: string | null;
  usageLimit: number | null;
  usedCount: number;
};

const emptyForm = {
  code: "",
  description: "",
  type: "PERCENT" as "PERCENT" | "FIXED",
  value: "",
  minSpend: "0",
  maxDiscount: "",
  isActive: true,
  expiresAt: "",
  usageLimit: "",
};

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    value
  );
}

export function AdminVoucherManager({ initialVouchers }: { initialVouchers: VoucherRow[] }) {
  const router = useRouter();
  const [vouchers, setVouchers] = useState(initialVouchers);
  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function resetForm() {
    setForm({ ...emptyForm });
    setEditingId(null);
  }

  function refresh() {
    fetch("/api/admin/vouchers")
      .then((r) => r.json())
      .then((d) => setVouchers(d.items ?? []));
    router.refresh();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload = {
      code: form.code,
      description: form.description || undefined,
      type: form.type,
      value: form.value,
      minSpend: form.minSpend || 0,
      maxDiscount: form.maxDiscount ? form.maxDiscount : null,
      isActive: form.isActive,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      usageLimit: form.usageLimit ? form.usageLimit : null,
    };

    startTransition(async () => {
      const url = editingId ? `/api/admin/vouchers/${editingId}` : "/api/admin/vouchers";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Gagal menyimpan voucher");
        return;
      }
      resetForm();
      refresh();
    });
  }

  function handleEdit(v: VoucherRow) {
    setEditingId(v.id);
    setForm({
      code: v.code,
      description: v.description ?? "",
      type: v.type,
      value: String(v.value),
      minSpend: String(v.minSpend),
      maxDiscount: v.maxDiscount != null ? String(v.maxDiscount) : "",
      isActive: v.isActive,
      expiresAt: v.expiresAt ? v.expiresAt.slice(0, 10) : "",
      usageLimit: v.usageLimit != null ? String(v.usageLimit) : "",
    });
    setError(null);
  }

  function handleDelete(id: string) {
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/admin/vouchers/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(typeof data.error === "string" ? data.error : "Gagal menghapus voucher");
        return;
      }
      refresh();
    });
  }

  const inputClass =
    "mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600";

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="rounded-xl border border-stone-200 bg-white p-5">
        <h2 className="font-heading font-semibold text-stone-900">{editingId ? "Edit voucher" : "Tambah voucher"}</h2>
        {error && <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-stone-700">Kode</label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
              required
              className={`${inputClass} font-mono uppercase`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700">Deskripsi</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700">Tipe</label>
            <select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as "PERCENT" | "FIXED" }))}
              className={inputClass}
            >
              <option value="PERCENT">Persentase (%)</option>
              <option value="FIXED">Nominal (Rp)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700">
              Nilai {form.type === "PERCENT" ? "(%)" : "(Rp)"}
            </label>
            <input
              type="number"
              min="0"
              value={form.value}
              onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700">Min. belanja (Rp)</label>
            <input
              type="number"
              min="0"
              value={form.minSpend}
              onChange={(e) => setForm((f) => ({ ...f, minSpend: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700">
              Maks. potongan (Rp) <span className="font-normal text-stone-400">opsional</span>
            </label>
            <input
              type="number"
              min="0"
              value={form.maxDiscount}
              onChange={(e) => setForm((f) => ({ ...f, maxDiscount: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700">
              Kadaluarsa <span className="font-normal text-stone-400">opsional</span>
            </label>
            <input
              type="date"
              value={form.expiresAt}
              onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700">
              Kuota pakai <span className="font-normal text-stone-400">opsional</span>
            </label>
            <input
              type="number"
              min="1"
              value={form.usageLimit}
              onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value }))}
              className={inputClass}
            />
          </div>
        </div>

        <label className="mt-3 flex items-center gap-2 text-sm text-stone-700">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
            className="rounded border-stone-300 text-emerald-700 focus:ring-emerald-600"
          />
          Aktif
        </label>

        <div className="mt-4 flex items-center gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
          >
            {isPending ? "Menyimpan..." : editingId ? "Simpan perubahan" : "Tambah"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="text-sm text-stone-500 hover:underline">
              Batal
            </button>
          )}
        </div>
      </form>

      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-stone-200 bg-stone-50 text-stone-500">
            <tr>
              <th className="px-4 py-3 font-medium">Kode</th>
              <th className="px-4 py-3 font-medium">Potongan</th>
              <th className="px-4 py-3 font-medium">Min. belanja</th>
              <th className="px-4 py-3 font-medium">Dipakai</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {vouchers.map((v) => (
              <tr key={v.id} className="border-b border-stone-100 last:border-0">
                <td className="px-4 py-3 font-mono font-medium text-stone-900">{v.code}</td>
                <td className="px-4 py-3 text-stone-600">
                  {v.type === "PERCENT" ? `${v.value}%` : formatRupiah(v.value)}
                </td>
                <td className="px-4 py-3 text-stone-600">{formatRupiah(v.minSpend)}</td>
                <td className="px-4 py-3 text-stone-600">
                  {v.usedCount}
                  {v.usageLimit != null ? ` / ${v.usageLimit}` : ""}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      v.isActive ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-500"
                    }`}
                  >
                    {v.isActive ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <button onClick={() => handleEdit(v)} className="text-emerald-700 hover:underline">
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(v.id)}
                      disabled={isPending}
                      className="text-red-600 hover:underline disabled:opacity-50"
                    >
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {vouchers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-stone-400">
                  Belum ada voucher.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
