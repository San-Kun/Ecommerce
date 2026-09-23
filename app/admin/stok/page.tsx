import Link from "next/link";
import { prisma } from "@/lib/db";

const LOW_STOCK_THRESHOLD = 5;

const unitLabel: Record<string, string> = { GRAM: "gram", KG: "kg", IKAT: "ikat", PCS: "pcs" };

export default async function AdminStokPage() {
  // Produk aktif dengan stok menipis (<= 5), stok paling sedikit di atas.
  const lowStock = await prisma.product.findMany({
    where: { status: "AKTIF", stock: { lte: LOW_STOCK_THRESHOLD } },
    orderBy: { stock: "asc" },
    include: { category: { select: { name: true } } },
  });

  const outOfStock = lowStock.filter((p) => p.stock === 0).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-bold text-stone-900">Peringatan Stok</h1>
        <p className="text-sm text-stone-500">
          {lowStock.length} produk stoknya menipis (≤ {LOW_STOCK_THRESHOLD}), {outOfStock} di antaranya habis.
        </p>
      </div>

      {lowStock.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-300 bg-white p-8 text-center text-stone-400">
          Semua produk stoknya aman. 👍
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-stone-500">
              <tr>
                <th className="px-4 py-3 font-medium">Produk</th>
                <th className="px-4 py-3 font-medium">Kategori</th>
                <th className="px-4 py-3 font-medium">Sisa stok</th>
                <th className="px-4 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {lowStock.map((p) => (
                <tr key={p.id} className="border-b border-stone-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-stone-900">{p.name}</td>
                  <td className="px-4 py-3 text-stone-600">{p.category.name}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.stock === 0 ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {p.stock === 0 ? "Habis" : `${p.stock} ${unitLabel[p.unit] ?? p.unit.toLowerCase()}`}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/produk/${p.slug}`} className="text-emerald-700 hover:underline">
                      Perbarui stok
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
