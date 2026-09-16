"use client";

import { useState, useTransition } from "react";
import Link from "next/link";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  categoryName: string;
  price: number;
  unit: string;
  stock: number;
  status: "AKTIF" | "NONAKTIF" | "HABIS";
  isOrganic: boolean;
};

type Category = { id: string; name: string };

const statusStyle: Record<ProductRow["status"], string> = {
  AKTIF: "bg-emerald-50 text-emerald-700",
  NONAKTIF: "bg-stone-100 text-stone-500",
  HABIS: "bg-amber-50 text-amber-700",
};

const statusLabel: Record<ProductRow["status"], string> = {
  AKTIF: "Aktif",
  NONAKTIF: "Nonaktif",
  HABIS: "Stok habis",
};

const unitLabel: Record<string, string> = {
  GRAM: "gram",
  KG: "kg",
  IKAT: "ikat",
  PCS: "pcs",
};

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function ProductTable({
  initialProducts,
  categories,
}: {
  initialProducts: ProductRow[];
  categories: Category[];
}) {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [isPending, startTransition] = useTransition();
  const [errorSlug, setErrorSlug] = useState<string | null>(null);

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter ? p.categoryName === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });

  function handleDeactivate(slug: string) {
    setErrorSlug(null);
    startTransition(async () => {
      const res = await fetch(`/api/products/${slug}`, { method: "DELETE" });
      if (!res.ok) {
        setErrorSlug(slug);
        return;
      }
      setProducts((prev) => prev.map((p) => (p.slug === slug ? { ...p, status: "NONAKTIF" } : p)));
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          placeholder="Cari nama produk"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 sm:max-w-xs"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
        >
          <option value="">Semua kategori</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg border border-stone-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-stone-200 bg-stone-50 text-stone-500">
            <tr>
              <th className="px-4 py-3 font-medium">Produk</th>
              <th className="px-4 py-3 font-medium">Kategori</th>
              <th className="px-4 py-3 font-medium">Harga</th>
              <th className="px-4 py-3 font-medium">Stok</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-stone-100 last:border-0">
                <td className="px-4 py-3">
                  <div className="font-medium text-stone-900">{p.name}</div>
                  {p.isOrganic && <span className="text-xs text-emerald-600">Organik</span>}
                </td>
                <td className="px-4 py-3 text-stone-600">{p.categoryName}</td>
                <td className="px-4 py-3 text-stone-600">
                  {formatRupiah(p.price)} / {unitLabel[p.unit] ?? p.unit}
                </td>
                <td className="px-4 py-3 text-stone-600">{p.stock}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusStyle[p.status]}`}>
                    {statusLabel[p.status]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link href={`/admin/produk/${p.slug}`} className="text-sm text-emerald-700 hover:underline">
                      Edit
                    </Link>
                    {p.status !== "NONAKTIF" && (
                      <button
                        onClick={() => handleDeactivate(p.slug)}
                        disabled={isPending}
                        className="text-sm text-red-600 hover:underline disabled:opacity-50"
                      >
                        Nonaktifkan
                      </button>
                    )}
                  </div>
                  {errorSlug === p.slug && <p className="mt-1 text-xs text-red-600">Gagal memproses, coba lagi.</p>}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-stone-400">
                  Tidak ada produk yang cocok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
