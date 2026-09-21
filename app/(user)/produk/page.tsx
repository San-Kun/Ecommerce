import Link from "next/link";
import { prisma } from "@/lib/db";
import { ProductGrid } from "@/components/product/ProductGrid";

export default async function ProductListPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string }>;
}) {
  const { search, category } = await searchParams;

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: {
        status: "AKTIF",
        ...(search ? { name: { contains: search } } : {}),
        ...(category ? { category: { slug: category } } : {}),
      },
      orderBy: { soldCount: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const activeCategory = category ? categories.find((c) => c.slug === category) : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <form action="/produk" className="max-w-md">
        <div className="flex overflow-hidden rounded-full border border-stone-200 bg-white">
          <input
            type="text"
            name="search"
            defaultValue={search ?? ""}
            placeholder="Cari bayam, tomat, cabai..."
            className="w-full px-4 py-2.5 text-sm text-stone-900 outline-none placeholder:text-stone-400"
          />
          <button type="submit" className="bg-emerald-700 px-5 text-sm font-medium text-white hover:bg-emerald-600">
            Cari
          </button>
        </div>
      </form>

      <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1">
        <Link
          href="/produk"
          className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium ${
            !category
              ? "border-emerald-700 bg-emerald-700 text-white"
              : "border-emerald-200 bg-emerald-50 text-emerald-800 hover:border-emerald-400"
          }`}
        >
          Semua
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/produk?category=${c.slug}`}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium ${
              category === c.slug
                ? "border-emerald-700 bg-emerald-700 text-white"
                : "border-emerald-200 bg-emerald-50 text-emerald-800 hover:border-emerald-400"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      <h1 className="font-heading mt-6 text-lg font-semibold text-stone-900">
        {search ? `Hasil untuk "${search}"` : (activeCategory?.name ?? "Semua Produk")}
      </h1>
      <p className="text-sm text-stone-500">{products.length} produk ditemukan</p>

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
  );
}
