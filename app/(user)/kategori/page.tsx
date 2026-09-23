import Link from "next/link";
import { prisma } from "@/lib/db";
import { LeafIcon } from "@/components/icons/LeafIcon";

export default async function KategoriPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { products: { where: { status: "AKTIF" } } } },
    },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-heading text-xl font-bold text-stone-900">Kategori Produk</h1>
      <p className="text-sm text-stone-500">Pilih kategori untuk menjelajah produk segar kami.</p>

      {categories.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <LeafIcon className="h-12 w-12 text-emerald-200" />
          <p className="mt-4 text-stone-400">Belum ada kategori.</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/produk?category=${c.slug}`}
              className="leaf-pattern group flex flex-col justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-5 transition hover:border-emerald-500 hover:shadow-sm"
            >
              <LeafIcon className="h-7 w-7 text-emerald-500 group-hover:text-emerald-700" />
              <div className="mt-6">
                <p className="font-heading font-semibold text-stone-900">{c.name}</p>
                <p className="text-xs text-stone-500">{c._count.products} produk</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
