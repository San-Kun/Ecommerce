import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PaketMenuForm } from "@/components/admin/PaketMenuForm";

export default async function EditPaketMenuPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const [paket, products] = await Promise.all([
    prisma.paketMenu.findUnique({ where: { slug }, include: { items: true } }),
    prisma.product.findMany({ where: { status: "AKTIF" }, orderBy: { name: "asc" }, select: { id: true, name: true, unit: true } }),
  ]);

  if (!paket) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-bold text-stone-900">Edit Paket Menu</h1>
        <p className="text-sm text-stone-500">{paket.name}</p>
      </div>
      <PaketMenuForm
        mode="edit"
        slugParam={paket.slug}
        products={products.map((p) => ({ id: p.id, name: p.name, unit: p.unit }))}
        initialValues={{
          name: paket.name,
          slug: paket.slug,
          description: paket.description ?? "",
          price: paket.price.toString(),
          image: paket.image ?? "",
          items: paket.items.map((it) => ({ productId: it.productId, quantity: it.quantity })),
        }}
      />
    </div>
  );
}
