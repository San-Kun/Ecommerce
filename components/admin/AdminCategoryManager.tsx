"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  productCount: number;
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function AdminCategoryManager({ initialCategories }: { initialCategories: CategoryRow[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function resetForm() {
    setName("");
    setSlug("");
    setSlugTouched(false);
    setEditingId(null);
  }

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function refresh() {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.items ?? []));
    router.refresh();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const url = editingId ? `/api/categories/${editingId}` : "/api/categories";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Gagal menyimpan kategori");
        return;
      }
      resetForm();
      refresh();
    });
  }

  function handleEdit(cat: CategoryRow) {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setSlugTouched(true);
    setError(null);
  }

  function handleDelete(id: string) {
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Gagal menghapus kategori");
        return;
      }
      refresh();
    });
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="rounded-xl border border-stone-200 bg-white p-5">
        <h2 className="font-heading font-semibold text-stone-900">
          {editingId ? "Edit kategori" : "Tambah kategori"}
        </h2>
        {error && <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-stone-700">Nama</label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700">Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              required
              className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm font-mono focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>
        </div>

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
              <th className="px-4 py-3 font-medium">Nama</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Produk</th>
              <th className="px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-b border-stone-100 last:border-0">
                <td className="px-4 py-3 font-medium text-stone-900">{c.name}</td>
                <td className="px-4 py-3 font-mono text-stone-500">{c.slug}</td>
                <td className="px-4 py-3 text-stone-600">{c.productCount}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <button onClick={() => handleEdit(c)} className="text-emerald-700 hover:underline">
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      disabled={isPending || c.productCount > 0}
                      title={c.productCount > 0 ? "Tidak bisa dihapus, masih ada produk" : undefined}
                      className="text-red-600 hover:underline disabled:cursor-not-allowed disabled:text-stone-300 disabled:no-underline"
                    >
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-stone-400">
                  Belum ada kategori.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
