import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { ProductGrid } from "@/components/product/ProductGrid";

type SortKey = "terbaru" | "termurah" | "termahal" | "terlaris";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "terlaris", label: "Terlaris" },
  { value: "terbaru", label: "Terbaru" },
  { value: "termurah", label: "Harga termurah" },
  { value: "termahal", label: "Harga termahal" },
];

const SORT_ORDER: Record<SortKey, Prisma.ProductOrderByWithRelationInput> = {
  terbaru: { createdAt: "desc" },
  termurah: { price: "asc" },
  termahal: { price: "desc" },
  terlaris: { soldCount: "desc" },
};

export default async function ProductListPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    category?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}) {
  const { search, category, sort, minPrice, maxPrice } = await searchParams;

  const sortKey: SortKey = (["terbaru", "termurah", "termahal", "terlaris"] as const).includes(sort as SortKey)
    ? (sort as SortKey)
    : "terlaris";

  const min = minPrice ? Number(minPrice) : undefined;
  const max = maxPrice ? Number(maxPrice) : undefined;

  const where: Prisma.ProductWhereInput = {
    status: "AKTIF",
    ...(search ? { name: { contains: search } } : {}),
    ...(category ? { category: { slug: category } } : {}),
    ...(min !== undefined || max !== undefined
      ? {
          price: {
            ...(min !== undefined && !Number.isNaN(min) ? { gte: min } : {}),
            ...(max !== undefined && !Number.isNaN(max) ? { lte: max } : {}),
          },
        }
      : {}),
  };

  const [products, categories] = await Promise.all([
    prisma.product.findMany({ where, orderBy: SORT_ORDER[sortKey] }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const activeCategory = category ? categories.find((c) => c.slug === category) : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Pencarian */}
      <form action="/produk" className="max-w-md">
        {category && <input type="hidden" name="category" value={category} />}
        {sort && <input type="hidden" name="sort" value={sort} />}
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

      {/* Rail kategori */}
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

      {/* Filter harga + urutkan */}
      <form action="/produk" className="mt-4 flex flex-wrap items-end gap-3 rounded-xl border border-dashed border-stone-300 bg-white p-4">
        {search && <input type="hidden" name="search" value={search} />}
        {category && <input type="hidden" name="category" value={category} />}

        <div>
          <label className="block text-xs font-medium text-stone-500">Harga min</label>
          <input
            type="number"
            name="minPrice"
            defaultValue={minPrice ?? ""}
            min={0}
            placeholder="0"
            className="mt-1 w-28 rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-500">Harga maks</label>
          <input
            type="number"
            name="maxPrice"
            defaultValue={maxPrice ?? ""}
            min={0}
            placeholder="100000"
            className="mt-1 w-28 rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-500">Urutkan</label>
          <select
            name="sort"
            defaultValue={sortKey}
            className="mt-1 rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
        >
          Terapkan
        </button>
      </form>

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
