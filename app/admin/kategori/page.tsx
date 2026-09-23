import { prisma } from "@/lib/db";
import { AdminCategoryManager } from "@/components/admin/AdminCategoryManager";

export default async function AdminKategoriPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-bold text-stone-900">Kategori</h1>
        <p className="text-sm text-stone-500">Kelola kategori produk toko kamu.</p>
      </div>

      <AdminCategoryManager
        initialCategories={categories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          productCount: c._count.products,
        }))}
      />
    </div>
  );
}
