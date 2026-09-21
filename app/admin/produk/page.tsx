import Link from "next/link";
import type { Product, Category } from "@prisma/client";
import { prisma } from "@/lib/db";
import { ProductTable } from "@/components/admin/ProductTable";

type ProductWithCategory = Product & { category: { name: string } };

export default async function AdminProdukPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      include: { category: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-xl font-bold text-stone-900">Produk</h1>
          <p className="text-sm text-stone-500">{products.length} produk terdaftar</p>
        </div>
        <Link
          href="/admin/produk/baru"
          className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
        >
          Tambah produk
        </Link>
      </div>

      <ProductTable
        initialProducts={products.map((p: ProductWithCategory) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          categoryName: p.category.name,
          price: Number(p.price),
          unit: p.unit,
          stock: Number(p.stock),
          status: p.status,
          isOrganic: p.isOrganic,
        }))}
        categories={categories.map((c: Category) => ({ id: c.id, name: c.name }))}
      />
    </div>
  );
}
