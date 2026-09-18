import Link from "next/link";
import { prisma } from "@/lib/db";
import { ProductGrid } from "@/components/product/ProductGrid";

export default async function HomePage() {
  const products = await prisma.product.findMany({
    where: { status: "AKTIF" },
    orderBy: { soldCount: "desc" },
    take: 20,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-stone-900">Sayur segar, langsung dari petani</h1>
      <p className="mt-1 text-stone-500">Belanja kebutuhan dapur harian kamu, dikirim hari ini.</p>

      <Link
        href="/paket-menu"
        className="mt-4 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 hover:border-emerald-300"
      >
        <span className="text-sm font-medium text-emerald-800">
          🍲 Bingung mau masak apa? Coba Paket Menu — bahan lengkap sekali klik
        </span>
        <span className="text-sm text-emerald-700">Lihat semua →</span>
      </Link>

      <div className="mt-6">
        <ProductGrid
          products={products.map((p) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            price: Number(p.price),
            unit: p.unit,
            image: Array.isArray(p.images) ? ((p.images as string[])[0] ?? null) : null,
            isOrganic: p.isOrganic,
            stock: p.stock,
          }))}
        />
      </div>
    </div>
  );
}
