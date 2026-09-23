"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type PaketRow = {
  id: string;
  name: string;
  slug: string;
  price: number;
  itemCount: number;
};

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    value
  );
}

export function PaketMenuTable({ initialPakets }: { initialPakets: PaketRow[] }) {
  const router = useRouter();
  const [pakets, setPakets] = useState(initialPakets);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete(slug: string) {
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/paket-menu/${slug}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(typeof data.error === "string" ? data.error : "Gagal menghapus paket");
        return;
      }
      setPakets((prev) => prev.filter((p) => p.slug !== slug));
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-stone-200 bg-stone-50 text-stone-500">
            <tr>
              <th className="px-4 py-3 font-medium">Nama</th>
              <th className="px-4 py-3 font-medium">Harga</th>
              <th className="px-4 py-3 font-medium">Isi</th>
              <th className="px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {pakets.map((p) => (
              <tr key={p.id} className="border-b border-stone-100 last:border-0">
                <td className="px-4 py-3 font-medium text-stone-900">{p.name}</td>
                <td className="px-4 py-3 text-stone-600">{formatRupiah(p.price)}</td>
                <td className="px-4 py-3 text-stone-600">{p.itemCount} produk</td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <Link href={`/admin/paket-menu/${p.slug}`} className="text-emerald-700 hover:underline">
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(p.slug)}
                      disabled={isPending}
                      className="text-red-600 hover:underline disabled:opacity-50"
                    >
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {pakets.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-stone-400">
                  Belum ada paket menu.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
