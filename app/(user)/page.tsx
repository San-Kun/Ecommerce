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
