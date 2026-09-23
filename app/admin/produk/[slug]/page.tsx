import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function EditProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { slug } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  const images = Array.isArray(product.images) ? (product.images as string[]) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-bold text-stone-900">Edit produk</h1>
        <p className="text-sm text-stone-500">{product.name}</p>
      </div>
      <ProductForm
        mode="edit"
        slugParam={product.slug}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        initialValues={{
          name: product.name,
          slug: product.slug,
          description: product.description ?? "",
          price: product.price.toString(),
          unit: product.unit,
          weightPerUnit: product.weightPerUnit ?? "",
          stepQuantity: product.stepQuantity.toString(),
          minOrderQty: product.minOrderQty.toString(),
          stock: product.stock.toString(),
          isOrganic: product.isOrganic,
          origin: product.origin ?? "",
          categoryId: product.categoryId,
          imagesText: images.join("\n"),
        }}
      />
    </div>
  );
}
