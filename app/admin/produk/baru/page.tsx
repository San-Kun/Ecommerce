import { prisma } from "@/lib/db";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-bold text-stone-900">Tambah produk</h1>
        <p className="text-sm text-stone-500">Isi detail produk baru di bawah ini.</p>
      </div>
      <ProductForm mode="create" categories={categories.map((c) => ({ id: c.id, name: c.name }))} />
    </div>
  );
}
