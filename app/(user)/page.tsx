import Link from "next/link";
import { prisma } from "@/lib/db";
import { ProductGrid } from "@/components/product/ProductGrid";

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { status: "AKTIF" },
      orderBy: { soldCount: "desc" },
      take: 20,
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      {/* Hero: sapaan + pencarian, latar hijau tua dengan pola sulur samar -- bukan hero marketing generik */}
      <section className="leaf-pattern border-b border-emerald-900/10 bg-emerald-800 px-4 py-10 text-emerald-50">
        <div className="mx-auto max-w-6xl">
          <h1 className="font-heading text-3xl font-bold sm:text-4xl">Sayur segar, langsung dari petani</h1>
          <p className="mt-2 max-w-md text-emerald-100">
            Belanja kebutuhan dapur harian kamu, dipetik pagi ini, diantar sebelum masak.
          </p>

          <form action="/produk" className="mt-6 max-w-md">
            <div className="flex overflow-hidden rounded-full bg-white shadow-sm">
              <input
                type="text"
                name="search"
                placeholder="Cari bayam, tomat, cabai..."
                className="w-full bg-transparent px-4 py-2.5 text-sm text-stone-900 outline-none placeholder:text-stone-400"
              />
              <button
                type="submit"
                className="bg-emerald-700 px-5 text-sm font-medium text-white hover:bg-emerald-600"
              >
                Cari
              </button>
            </div>
          </form>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Rail kategori bergaya gantungan tag, scroll horizontal di mobile */}
        {categories.length > 0 && (
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/produk?category=${c.slug}`}
                className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-800 hover:border-emerald-400"
              >
                {c.name}
              </Link>
            ))}
          </div>
        )}

        {/* Banner Paket Menu bergaya kartu resep sobek */}
        <Link
          href="/paket-menu"
          className="relative mt-6 flex items-center justify-between overflow-hidden rounded-xl border border-dashed border-emerald-300 bg-white px-5 py-4 hover:border-emerald-500"
        >
          <div>
            <p className="font-heading font-semibold text-stone-900">Bingung mau masak apa?</p>
            <p className="text-sm text-stone-500">Coba Paket Menu — bahan lengkap sekali klik</p>
          </div>
          <span className="stamp-badge shrink-0 border-emerald-600 px-3 py-1 text-xs font-semibold text-emerald-700">
            lihat semua
          </span>
        </Link>

        <h2 className="font-heading mt-10 text-lg font-semibold text-stone-900">Baru dipetik hari ini</h2>
        <div className="mt-4">
          <ProductGrid
            products={products.map((p) => ({
              id: p.id,
              name: p.name,
              slug: p.slug,
              price: Number(p.price),
              unit: p.unit,
              image: Array.isArray(p.images) ? ((p.images as string[])[0] ?? null) : null,
              isOrganic: p.isOrganic,
              stock: Number(p.stock),
            }))}
          />
        </div>
      </div>
    </div>
  );
}
